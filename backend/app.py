from flask import Flask, jsonify, request, send_file, make_response
import psycopg2
from copy import copy
import datetime
from dateutil.relativedelta import relativedelta
import os
import shutil
import openpyxl
import pandas as pd

app = Flask(__name__)
app.json.sort_keys = False

#CORS
@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return response

# SERP DB - PostgreSQL接続
def get_connection():
    return psycopg2.connect('postgresql://serp:serp@postgres:5432/serp')

# カーソルをカラム名付き辞書形式に変換する
# カーソルはオープン状態で渡すこと
# 関数内で全行フェッチして辞書を作ります
def convertCursorToDict(cur):
    columns = [col[0] for col in cur.description]
    data = cur.fetchall()
    data_with_column_name = []
    for result in data:
        data_with_column_name.append(dict(zip(columns, result)))

    return data_with_column_name

# API No.1ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload():
    # エラーチェック
    if 'uploadFile' not in request.files:
        return jsonify({"status":-1, 'result':'uploadFile is required.'})

    file = request.files['uploadFile']
    fileName = file.filename
    if fileName == '' :
        return jsonify({"status":-1, 'result':'filename must not empty.'})

    try:
        return jsonify({"status":_fileupload(file)})
    except:
        return jsonify({"status":-1})

# API No.2 ファイル一覧
@app.route("/serp/api/filelist/<yyyymm>", methods=["GET"])
def filelist(yyyymm : str) :
  try:
    result = _filelist(yyyymm)
    if result == []:
        return jsonify({"status":1, "result":result})
    else:
        return jsonify({"status":0, "result":result})
  except:
    return jsonify({"status":-1})

# API No.3 マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", methods=["GET"])
def filemergelist(yyyymm: str):
  try:
    result = _filemergelist(yyyymm)
    if result == []:
        return jsonify({"status":1, "result":result})
    else:
        return jsonify({"status":0, "result":result})
  except:
    return jsonify({"status":-1})

# API No.4 データ取得
@app.route("/serp/api/filedetail/<manage_id>", methods=["GET"])
def filedetail(manage_id: str):
    try:
        return jsonify({"status": 0, "result": _filedetail(manage_id)})
    except:
        return jsonify({"status": -1})

# API No.5 マージ結果のデータ取得
@app.route("/serp/api/filemergedetail/<yyyymm>,<version>", methods=["GET"])
def filemergedetail(yyyymm: str, version: str):
    try:
        return jsonify({"status": 0, "result": _filemergedetail(yyyymm, version)})
    except:
        return jsonify({"status": -1})

# API No.6 ファイル削除
@app.route("/serp/api/filedelete/<manage_id>", methods=["DELETE"])
def filedelete(manage_id: str):
    try:
        return jsonify({"status": 0, "result": _filedelete(manage_id)})
    except:
        return jsonify({"status": -1})

# API No.8 マージ要求
@app.route("/serp/api/filemerge", methods=["PUT"])
def filemerge():
    try:
        if request.headers['Content-Type'] != 'application/json':
            return jsonify({"status": -1, "result":"Content-Type:application/jsonを指定してください"})
        
        # リクエストからJSON形式でデータを取得
        # 書式エラー時は例外が発生する

        # パラメータチェック
        manage_ids = request.json['manage_id']
        if not isinstance(manage_ids, list):
            return jsonify({"status": -1, "result": "管理IDは配列で指定してください"})

        if manage_ids == []:
            return jsonify({"status": -1, "result": "管理IDを指定してください"})

        if len(manage_ids) == 1:
            return jsonify({"status": -1, "result": "管理IDの指定が1件のためマージ出来ません"})
        
        if len(manage_ids) != len(list(set(manage_ids))):
            return jsonify({"status": -1, "result": "管理IDの指定が重複しています"})

        fiscal_date = ''
        file_div_result = []
        with get_connection() as conn:
            manage_ids = [str(manage_id) for manage_id in manage_ids]
            for manage_id in manage_ids:
                work_date = _getFiscalDateByManageID(conn, manage_id)
                # 管理ID存在チェック
                if work_date == '':
                    return jsonify({"status": -1, "result": "管理IDが不正です"})
                if fiscal_date == '':
                    fiscal_date = work_date
                # 勘定年月が混在していたらNG
                if fiscal_date != work_date:
                    return jsonify({"status": -1, "result": "指定された管理IDは勘定年月が混在しています"})
                file_div_result.append(_getfilediv(conn,manage_id))

        if len(set(file_div_result)) != 3:
            return jsonify({"status": -1, "result": "完成PJ,仕掛PJ,経費の3ファイルを指定してください"})

        # マージ処理
        _filemerge(manage_ids, fiscal_date)

        return jsonify({"status": 0, "result":fiscal_date})
    except:
        return jsonify({"status": -1})

# API No.9 ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>,<version>", methods=["GET"])
def filedownload(yyyymm: str, version: str):    
    filepath = "./" + _filedownload(yyyymm, version)
    filename = os.path.basename(filepath)
    return send_file(filepath, as_attachment=True,
                     download_name=filename,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return jsonify({"status": 0})

# ファイルアップロード
def _fileupload(file : any):
    # リクエストパラメータの受取
    fiscal_date = request.form["fiscal_date"]
    file_nm = request.form["file_nm"]
    file_div = request.form["file_div"]

    # ファイル読込
    with get_connection() as conn:
        # ファイル情報マスタ登録
        manege_id = _insertFileInfo(conn, fiscal_date, file_div, file_nm)

        # ファイル区分別登録処理
        match file_div:
            case "F":   # 完成プロジェクト
                # Excelファイル読み込み
                df = pd.read_excel(file, sheet_name=0, skipfooter=1, skiprows=1)

                # 取得内容を1行・1カラムずつ分解して登録
                for index, data in df.iterrows():
                    div_cd = data[0]                    #原価部門コード
                    orders = str(data[2]).split('-')    #受注明細＋受注行番号＋部門コード
                    order_detail = orders[0]            #受注明細
                    order_rowno = orders[1]             #受注行番号
                    project_nm = data[3]                #契約工事略名
                    customer = data[4]                  #得意先名
                    cost_material = data[5]             #材料費
                    cost_labor = data[6]                #労務費
                    cost_subcontract = data[7]          #外注費
                    cost = data[8]                      #経費
                    sales = data[10]                    #売上高

                    # 感性情報1レコード登録
                    _insertFgFileInfo(conn, manege_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost, sales)
                    # 案件情報登録
                    _insertTopicInfo(conn, order_detail, project_nm)
            case "W":   # 仕掛プロジェクト
                # Excelファイル読み込み
                df = pd.read_excel(file, sheet_name=0, skipfooter=1, skiprows=1)

                # 取得内容を1行・1カラムずつ分解して登録
                for index, data in df.iterrows():
                    div_cd = data[0]                    #原価部門コード
                    orders = str(data[2]).split('-')    #受注明細＋受注行番号＋部門コード
                    order_detail = orders[0]            #受注明細
                    order_rowno = orders[1]             #受注行番号
                    project_nm = data[3]                #契約工事略名
                    customer = data[4]                  #得意先名
                    cost_material = data[5]             #材料費
                    cost_labor = data[6]                #労務費
                    cost_subcontract = data[7]          #外注費
                    cost = data[8]                      #経費

                    # 仕掛情報1レコード登録
                    _insertWipFileInfo(conn, manege_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost)
                    # 案件情報登録
                    _insertTopicInfo(conn, order_detail, project_nm)
            case "H":   # HRMOS経費
                # Excelファイル読み込み
                df = pd.read_excel(file, sheet_name=0, skipfooter=1, skiprows=5, usecols=['申請No.', '申請書', '申請者', 'TSジョブコード', '金額'], dtype=object)
                df_no_na = df.dropna(subset=['申請No.'])
                
                # 取得内容を1行・1カラムずつ分解して登録
                for index, data in df_no_na.iterrows():
                    apply_no = data[0]      #申請No.
                    apply_type = data[1]    #申請書
                    applicant = data[2]     #申請者
                    if (str(data[3])) == 'nan':
                        job_cd = ""         #TSジョブコード
                    else:
                        job_cd = data[3] 
                    cost = data[4]          #金額

                    # HRMOS経費分原価登録
                    _insertHrmosExpense(conn, manege_id, apply_no, apply_type, applicant, job_cd, cost)
 
    return 0

# 新規管理ID採番
def _getNextManageID(conn : any):
    with conn.cursor() as cur:
        cur.execute(
            "select coalesce(cast(max(cast(manage_id as numeric)) + 1 as varchar(23)), '1') as manage_id from m_file_info")
        res = cur.fetchone()
        if res is None:
            return '1'
        return res[0]

# 新規バージョン採番
def _getNextVersion(conn : any, fiscal_date : str, file_div : str):
    with conn.cursor() as cur:
        cur.execute(
            "select coalesce(cast(max(cast(version as numeric)) + 1 as varchar(2)), '1') as version from m_file_info where fiscal_date = %s and file_div = %s", (fiscal_date, file_div))
        res = cur.fetchone()
        if res is None:
            return '0'
        return res[0]

# ファイル管理登録
def _insertFileInfo(conn : any, fiscal_date : str, file_div : str, file_name : str):
    manage_id = _getNextManageID(conn)
    version = _getNextVersion(conn, fiscal_date, file_div)
 
    with conn.cursor() as cur:
        cur.execute("insert into m_file_info (manage_id,fiscal_date,version,file_div,file_nm) values (%s, %s, %s, %s, %s)", (manage_id, fiscal_date, version, file_div, file_name))
   
    return manage_id

# HRMOS経費分原価登録
def _insertHrmosExpense(conn : any, manage_id : str, apply_no : str, apply_type : str, applicant : str, job_cd : str, cost : str):
    with conn.cursor() as cur:
        cur.execute("insert into t_hrmos_expense (manage_id,apply_no,apply_type,applicant,job_cd,cost) values (%s, %s, %s, %s, %s, %s)", (manage_id, apply_no, apply_type, applicant, job_cd, cost))

# 完成PJ台帳登録
def _insertFgFileInfo(conn : any, manage_id : str, div_cd : str, order_detail : str, order_rowno : str, customer : str, cost_material : str, cost_labor : str, cost_subcontract : str, cost : str, sales : str):
    with conn.cursor() as cur:
        cur.execute("insert into t_fg_project_info (manage_id,div_cd,order_detail,order_rowno,customer,cost_material,cost_labor,cost_subcontract,cost,sales) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (manage_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost, sales))

# 仕掛PJ台帳登録
def _insertWipFileInfo(conn : any, manage_id : str, div_cd : str, order_detail : str, order_rowno : str, customer : str, cost_material : str, cost_labor : str, cost_subcontract : str, cost : str):
    with conn.cursor() as cur:
        cur.execute("insert into t_wip_project_info (manage_id,div_cd,order_detail,order_rowno,customer,cost_material,cost_labor,cost_subcontract,cost) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (manage_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost))

# 案件情報登録
def _insertTopicInfo(conn : any, order_detail : str, project_nm : str):
    with conn.cursor() as cur:
        cur.execute("insert into m_topic_info (order_detail,project_nm) select %s, %s where not exists(SELECT order_detail FROM m_topic_info WHERE order_detail = %s)", (order_detail, project_nm, order_detail))

# ファイル情報マスタから勘定年月を指定して取得
def _filelist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from m_file_info where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)


# 仕掛情報テーブルから勘定年月を指定して取得
def _wiplist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_wip_info where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)

# マージ結果テーブルから勘定年月を指定して取得
def _filemergelist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select t.fiscal_date, t.version, t.fg_id, f.file_nm as fg_file_name, t.wip_id, w.file_nm as wip_file_name, t.hrmos_id, h.file_nm as hrmos_file_name from t_merge_target t left join m_file_info f on t.fg_id = f.manage_id left join m_file_info w on t.wip_id = w.manage_id left join m_file_info h on t.hrmos_id = h.manage_id where t.fiscal_date = %s order by version', (yyyymm, ))
            return convertCursorToDict(cur)

# データ取得
def _filedetail(manage_id: str):
    query = {
        'F': 'select f.div_cd AS "原価部門コード", md.div_nm as "原価部門名", f.order_detail as "受注明細", f.order_rowno as "受注行番号", mti.project_nm as "契約工事略名", f.customer as "得意先名", coalesce(cost_material, 0) as "材料費", coalesce(cost_labor, 0) as "労務費", coalesce(cost_subcontract, 0) as "外注費", coalesce(cost, 0) as "経費", coalesce(sales, 0) as "売上高" from t_fg_project_info f left join m_topic_info mti on f.order_detail = mti.order_detail left join m_div md on f.div_cd = md.div_cd where manage_id = %s',
        'W': 'select w.div_cd AS "原価部門コード", md.div_nm as "原価部門名", w.order_detail as "受注明細", w.order_rowno as "受注行番号", mti.project_nm as "契約工事略名", w.customer as "得意先名", coalesce(cost_material, 0) as "材料費", coalesce(cost_labor, 0) as "労務費", coalesce(cost_subcontract, 0) as "外注費", coalesce(cost, 0) as "経費" from t_wip_project_info w left join m_topic_info mti on w.order_detail = mti.order_detail left join m_div md on w.div_cd = md.div_cd where manage_id = %s',
        'H': 'select apply_no as "申請No", apply_type as "申請書", applicant as "申請者", job_cd as "TSジョブコード", cost as "経費" from t_hrmos_expense where manage_id = %s'
    }

    with get_connection() as conn:
        with conn.cursor() as cur:
            file_div = _getfilediv(conn, manage_id)
            if file_div == []:
                return file_div
            cur.execute(query.get(file_div), (manage_id,))
            return convertCursorToDict(cur)
# データ削除
def _filedelete(manage_id: str):
    query = {
        'F': 'delete from t_fg_project_info where manage_id = %s',
        'W': 'delete from t_wip_project_info where manage_id = %s',
        'H': 'delete from t_hrmos_expense where manage_id = %s'
    }

    with get_connection() as conn:
        with conn.cursor() as cur:
            file_div = _getfilediv(conn, manage_id)
            if file_div == []:
                return file_div
            cur.execute(query.get(file_div), (manage_id,))        
            cur.execute('delete from m_file_info where manage_id = %s', (manage_id,))
        conn.commit()


# ファイル区分取得
def _getfilediv(conn: any, manage_id: str):
    with conn.cursor() as cur:
        cur.execute(
            'select file_div from m_file_info where manage_id = %s', (manage_id, ))
        res = cur.fetchone()
        if res is None:
            return []
        return res[0]

# マージ結果テーブルから勘定年月とバージョンを指定して取得
def _filemergedetail(yyyymm: str, version: str):
    sql = ""\
    "select "\
    "      case "\
    "        when t.product_div = '1' "\
    "            then '' "\
    "        when t.product_div = '2' "\
    "            then '対象' "\
    "        end as 繰越対象 "\
    "    , t.order_detail as 受注明細 "\
    "    , mti.project_nm as 件名"\
    "    , coalesce(cost_labor, 0)                as 労務費 "\
    "    , coalesce(cost_subcontract, 0)          as 外注費 "\
    "    , coalesce(cost, 0)                      as 旅費交通費 "\
    "    , coalesce(change_value, 0)              as 翌月繰越    "\
    "from "\
    "    t_merge_result t "\
    "    left join m_topic_info mti "\
    "        on t.order_detail = mti.order_detail "\
    "where "\
    "    t.fiscal_date = %s "\
    "    and t.version = %s"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (yyyymm, version))
            return convertCursorToDict(cur)

# マージ要求
def _filemerge(manage_ids:str, fiscal_date:str):
    #delete_result_sql = "delete from t_merge_result where fiscal_date = %s"
    #delete_target_sql = "delete from t_merge_target where fiscal_date = %s"
    select_version_sql = "select version from t_merge_target where fiscal_date = %s order by version desc" 
    insert_target_sql = 'insert into t_merge_target (fiscal_date, version, fg_id, wip_id, hrmos_id) values (%s,%s,%s,%s,%s)'

    merge_sql = \
    "insert into t_merge_result "\
    "with wip as ( "\
    "    select"\
    "          order_detail"\
        "        , sum(cost_labor) + sum(cost_subcontract) + sum(cost) as total_cost_wip"\
        "        , sum(cost_labor) as cost_labor_wip"\
        "        , sum(cost_subcontract) as cost_subcontract_wip"\
        "        , sum(cost) as cost_wip"\
    "    from"\
    "        t_wip_info "\
    "    where"\
    "         fiscal_date = %s"\
    "    group by"\
    "        order_detail"\
    ") "\
    "select"\
    "      fiscal_date"\
    "    , %s as version"\
    "    , t_fg_project_info.order_detail"\
    "    , t_fg_project_info.manage_id fg_id"\
    "    , null wip_id"\
    "    , cost_labor - coalesce(cost_labor_wip, 0)   as cost_labor"\
    "    , cost_subcontract - coalesce(cost_subcontract_wip, 0) as cost_subcontract"\
    "    , cost - coalesce(cost_wip, 0)   as cost"\
    "    , null                                 as change_value"\
    "    , '1'                                  as product_div "\
    "from"\
    "    t_fg_project_info "\
    "    left join wip "\
    "        on t_fg_project_info.order_detail = wip.order_detail "\
    "    inner join m_file_info "\
    "        on t_fg_project_info.manage_id = m_file_info.manage_id "\
    "where"\
    "    t_fg_project_info.manage_id in %s "\
    "union all "\
    "select"\
    "      fiscal_date"\
    "    , %s as version"\
    "    , t_wip_project_info.order_detail"\
    "    , null fg_id"\
    "    , t_wip_project_info.manage_id wip_id"\
    "    , cost_labor - coalesce(cost_labor_wip, 0)   as cost_labor"\
    "    , cost_subcontract - coalesce(cost_subcontract_wip, 0) as cost_subcontract"\
    "    , cost - coalesce(cost_wip, 0)   as cost"\
    "    , cost_labor + cost_subcontract + cost as change_value"\
    "    , '2'                                  as product_div "\
    "from"\
    "    t_wip_project_info "\
    "    left join wip "\
    "        on t_wip_project_info.order_detail = wip.order_detail "\
    "    inner join m_file_info "\
    "        on t_wip_project_info.manage_id = m_file_info.manage_id "\
    "where"\
    "    t_wip_project_info.manage_id in %s"

    with get_connection() as conn:
        # バージョン採番
        version = '0'
        with conn.cursor() as cur:
            cur.execute(select_version_sql, (fiscal_date,))
            res = cur.fetchone()
            if res is None:
                version = '0'
            else:
                version = str(int(res[0]) + 1)

        # マージ処理
        with conn.cursor() as cur:
            cur.execute(merge_sql, (_getPrevMonth(fiscal_date), version, tuple(manage_ids), version, tuple(manage_ids),))
            # マージ対象ファイルIDを保存
            for manage_id in manage_ids:
                file_div = str(_getfilediv(conn,manage_id))
                match file_div:
                    case 'F':
                        fg = manage_id
                    case 'W':
                        wip = manage_id
                        # 勘定年月分の仕掛情報テーブルを洗替え
                        cur.execute("delete from t_wip_info where fiscal_date = %s", (fiscal_date,))
                        cur.execute("insert into t_wip_info (fiscal_date,order_detail,cost_labor,cost_subcontract,cost) select %s as fiscal_date, order_detail, cost_labor, cost_subcontract, cost from t_wip_project_info where manage_id = %s", (fiscal_date, manage_id,))
                    case 'H':
                        hrmos = manage_id
            cur.execute(insert_target_sql, (fiscal_date, version, fg,wip,hrmos,))

def _filedownload(yyyymm : str, version : str):
    target_file = yyyymm + '.xlsx'

    shutil.copy('template.xlsx', target_file)
    wb = openpyxl.load_workbook(target_file)

    ws = wb.active
    ws.title = "サマリー・仕掛り" + yyyymm[4:6] + "月"

    # ヘッダ行
    ws.cell(1, 2, yyyymm[0:4] + "年" + yyyymm[4:6] + "月　仕掛 原価一覧")

    # サマリー
    result = _loadmerge(yyyymm, version)
    result_fg = _loadmerge_fg(yyyymm, version)
    result_wip = _loadmerge_wip(yyyymm, version)
    result_prev_wip = _loatmerge_perv_wip(yyyymm)
    result_hrmos = _loadmerge_hrmos(yyyymm, version)
    
    summary_base = ws[3]
    ws.unmerge_cells('H8:I8')
    ws.insert_rows(4, len(result) - 2)
    for r in range(len(result) - 2):
        i = 1
        for cell in summary_base:
            ws.cell(row = r + 4, column = i)._style = copy(cell._style)
            i += 1
    for r in range(len(result) + 3):
        ws.row_dimensions[r + 4].height = copy(ws.row_dimensions[3].height)
    ws.merge_cells('H' + str(len(result) +6) + ':I' + str(len(result) +6))
    ws.cell(len(result) + 6, 8, '=H' + str(len(result) + 5) + '+I' + str(len(result) + 5))
    
    row = 3
    for item in result:
        if item['order_detail'] == 'ZAB202300017':
            indirect = copy(item)
            continue
        if item['product_div'] == '2':
            ws.cell(row, 2, "○")  # 繰越(仕掛)
        else:
            ws.cell(row, 2, "")  # 繰越(完成)
        ws.cell(row, 3, item['project_nm'])   # 件名
        ws.cell(row, 4, item['total_cost_wip'])   # 前月繰越残
        ws.cell(row, 5, item['sales'])   # 当月売上
        ws.cell(row, 6, item['cost_labor'])   # 労務費
        ws.cell(row, 7, item['cost_subcontract'])   # 外注費
        ws.cell(row, 8, item['cost'])   # 旅費交通費
        ws.cell(row, 9, "")   # その他
        ws.cell(row, 10, '=F' + str(row) + '+G' + str(row) + '+H' + str(row) + '+I' + str(row) + '')  # 小計
        ws.cell(row, 11, '=IF(B' + str(row) + '="○",IF(E' + str(row) + '="",0,J' + str(row) + '),D' + str(row) + '+J' + str(row) + ')')  # 振替額
        ws.cell(row, 12, '=IF(B' + str(row) + '="○",D' + str(row) + '+J' + str(row) + '-K' + str(row) + ',"--")')  # 翌月繰越
        row += 1
    ws.cell(row, 10, '=F' + str(row) + '+G' + str(row) + '+H' + str(row) + '+I' + str(row) + '')  # 小計
    ws.cell(row, 11, '=IF(B' + str(row) + '="○",IF(E' + str(row) + '="",0,J' + str(row) + '),D' + str(row) + '+J' + str(row) + ')')  # 振替額
    ws.cell(row, 12, '=IF(B' + str(row) + '="○",D' + str(row) + '+J' + str(row) + '-K' + str(row) + ',"--")')  # 翌月繰越
    # 計算式を更新（間接プロジェクト）
    row += 1
    ws.cell(row, 6, indirect['cost_labor'])   # 労務費
    ws.cell(row, 7, indirect['cost_subcontract'])   # 外注費
    ws.cell(row, 8, 0)   # 旅費交通費
    ws.cell(row, 9, indirect['cost'])   # その他
    ws.cell(row, 10, '=F' + str(row) + '+G' + str(row) + '+H' + str(row) + '+I' + str(row) + '')  # 小計
    ws.cell(row, 11, '=IF(B' + str(row) + '="○",IF(E' + str(row) + '="",0,J' + str(row) + '),D' + str(row) + '+J' + str(row) + ')')  # 振替額
    ws.cell(row, 12, '=IF(B' + str(row) + '="○",D' + str(row) + '+J' + str(row) + '-K' + str(row) + ',"--")')  # 翌月繰越
    row += 1
    # 空行スキップ
    row += 1
    ws.cell(row, 4, '=SUM(D3:D' + str(row-2) + ')')  # 
    ws.cell(row, 5, '=SUM(E3:E' + str(row-2) + ')')  # 
    ws.cell(row, 6, '=SUM(F3:F' + str(row-2) + ')')  # 
    ws.cell(row, 7, '=SUM(G3:G' + str(row-2) + ')')  # 
    ws.cell(row, 8, '=SUM(H3:H' + str(row-2) + ')')  # 
    ws.cell(row, 9, '=SUM(I3:I' + str(row-2) + ')')  # 
    ws.cell(row, 10, '=SUM(J3:J' + str(row-2) + ')')  # 
    ws.cell(row, 11, '=SUM(K3:K' + str(row-2) + ')')  # 
    ws.cell(row, 12, '=SUM(L3:L' + str(row-2) + ')')  # 
    row += 7

    # 完成PJ
    fg_start_row = row
    for item in result_fg:
        ws.cell(row, 3, item['project_nm'])   # 件名
        ws.cell(row, 4, item['cost_labor'])   # 労務費
        ws.cell(row, 5, item['cost_subcontract'])   # 外注費
        ws.cell(row, 6, item['cost'])   # 旅費交通費
        ws.cell(row, 7, item['total_cost'])   # 合計
        ws.cell(row, 8, item['sales'])   # 売上
        row += 1   
    row = fg_start_row + 16
    ws.cell(row, 7, '=SUM(G' + str(fg_start_row) + ':G' + str(fg_start_row + 15) + ')')  # 小計
    ws.cell(row, 8, '=SUM(H' + str(fg_start_row) + ':H' + str(fg_start_row + 15) + ')')  # 小計
    row += 4

    # 仕掛PJ
    wip_start_row = row
    for item in result_wip:
        ws.cell(row, 3, item['project_nm'])   # 件名
        ws.cell(row, 4, item['cost_labor'])   # 労務費
        ws.cell(row, 5, item['cost_subcontract'])   # 外注費
        ws.cell(row, 6, item['cost'])   # 旅費交通費
        ws.cell(row, 7, item['total_cost'])   # 合計
        row += 1   
    row = wip_start_row + 8
    ws.cell(row, 7, '=SUM(G' + str(wip_start_row) + ':G' + str(wip_start_row + 7) + ')')  # 小計
    row += 4

    #前月仕掛
    wip_start_row = row
    for item in result_prev_wip:
        ws.cell(row, 3, item['project_nm'])   # 件名
        ws.cell(row, 4, item['cost_labor'])   # 労務費
        ws.cell(row, 5, item['cost_subcontract'])   # 外注費
        ws.cell(row, 6, item['cost'])   # 旅費交通費
        row += 1   
    for index in range(6):
        ws.cell(wip_start_row + index, 8, '=SUM(D' + str(wip_start_row + index) + ':F' + str(wip_start_row + index) + ')')   # 合計

    row = wip_start_row + 6
    ws.cell(row, 8, '=SUM(H' + str(wip_start_row) + ':H' + str(wip_start_row + 5) + ')')  # 小計
    row += 4
    
   # 完成PJ＋仕掛PJ
    total_start_row = row
    for item in result:
        if item['product_div'] == '1':
            ws.cell(row, 3, item['project_nm'])   # 件名
            ws.cell(row, 4, item['cost_labor'])   # 労務費
            ws.cell(row, 5, item['cost_subcontract'])   # 外注費
            ws.cell(row, 6, item['cost'])   # 旅費交通費
            row += 1   
    row = total_start_row + 15
    for item in result:
        if item['product_div'] == '2':
            ws.cell(row, 3, item['project_nm'])   # 件名
            ws.cell(row, 4, item['cost_labor'])   # 労務費
            ws.cell(row, 5, item['cost_subcontract'])   # 外注費
            ws.cell(row, 6, item['cost'])   # 旅費交通費
            row += 1   
    for index in range(23):
        ws.cell(total_start_row + index, 8, '=SUM(D' + str(total_start_row + index) + ':F' + str(total_start_row + index) + ')')   # 合計
        
    row = total_start_row + 23
    ws.cell(row, 4, '=SUM(D' + str(total_start_row) + ':D' + str(total_start_row + 22) + ')')  # 小計
    ws.cell(row, 5, '=SUM(E' + str(total_start_row) + ':E' + str(total_start_row + 22) + ')')  # 小計
    ws.cell(row, 6, '=SUM(F' + str(total_start_row) + ':F' + str(total_start_row + 22) + ')')  # 小計
    ws.cell(row, 8, '=SUM(H' + str(total_start_row) + ':H' + str(total_start_row + 22) + ')')  # 小計
    row = total_start_row + 27

    #HRMOS経費
    hrmos_start_row = row
    for item in result_hrmos:
        ws.cell(row, 3, item['apply_type'] + "：" + item['applicant'])   # 区分
        ws.cell(row, 4, item['job_cd'])   # TSジョブコード
        ws.cell(row, 5, item['cost'])   # 金額
        row += 1   
    for index in range(8):
        ws.cell(hrmos_start_row + index, 6, '=E' + str(hrmos_start_row + index) + '/1.1')   # 合計
    row = hrmos_start_row + 8
    ws.cell(row, 6, '=SUM(F' + str(hrmos_start_row) + ':F' + str(hrmos_start_row + 7) + ')')  # 小計

    wb.save(target_file)

    return target_file

# マージ結果
def _loadmerge(yyyymm : str, version : str):
    sql = "with wip as ( "\
        "    select"\
        "          order_detail"\
        "        , sum(cost_labor) + sum(cost_subcontract) + sum(cost) as total_cost_wip"\
        "        , sum(cost_labor) as cost_labor_wip"\
        "        , sum(cost_subcontract) as cost_subcontract_wip"\
        "        , sum(cost) as cost_wip"\
        "    from"\
        "        t_wip_info "\
        "    where"\
        "         fiscal_date = %s"\
        "    group by"\
        "        order_detail"\
        ") "\
        "select"\
        "     t_fg_project_info.order_detail"\
        "    , m_topic_info.project_nm"\
        "    , total_cost_wip"\
        "    , sales"\
        "    , cost_labor - coalesce(cost_labor_wip, 0)   as cost_labor"\
        "    , cost_subcontract - coalesce(cost_subcontract_wip, 0) as cost_subcontract"\
        "    , cost - coalesce(cost_wip, 0) as cost "\
        "    , null                                 as change_value"\
        "    , '1'                                  as product_div "\
        "from"\
        "    t_fg_project_info "\
        "    left join wip "\
        "        on t_fg_project_info.order_detail = wip.order_detail "\
        "    left join m_topic_info"\
        "        on t_fg_project_info.order_detail = m_topic_info.order_detail"\
        "    inner join m_file_info "\
        "        on t_fg_project_info.manage_id = m_file_info.manage_id "\
        "where"\
        "    t_fg_project_info.manage_id in (select fg_id from t_merge_target where fiscal_date = %s and version = %s) "\
        "union all "\
        "select"\
        "     t_wip_project_info.order_detail"\
        "    , m_topic_info.project_nm"\
        "    , total_cost_wip"\
        "    , null as sales"\
        "    , cost_labor - coalesce(cost_labor_wip, 0)   as cost_labor"\
        "    , cost_subcontract - coalesce(cost_subcontract_wip, 0) as cost_subcontract"\
        "    , cost - coalesce(cost_wip, 0) as cost "\
        "    , cost_labor + cost_subcontract + cost as change_value"\
        "    , '2'                                  as product_div "\
        "from"\
        "    t_wip_project_info "\
        "    left join wip "\
        "        on t_wip_project_info.order_detail = wip.order_detail "\
        "    left join m_topic_info"\
        "        on t_wip_project_info.order_detail = m_topic_info.order_detail"\
        "    inner join m_file_info "\
        "        on t_wip_project_info.manage_id = m_file_info.manage_id "\
        "where"\
        "    t_wip_project_info.manage_id in (select wip_id from t_merge_target where fiscal_date = %s and version = %s)"\
        " order by order_detail"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (_getPrevMonth(yyyymm), yyyymm, version, yyyymm, version, ))
            return convertCursorToDict(cur)
    

# マージ結果（完成）
def _loadmerge_fg(yyyymm : str, version : str):
    sql = "select "\
        "      m_topic_info.project_nm "\
        "    , cost_labor "\
        "    , cost_subcontract "\
        "    , cost "\
        "    , cost_labor + cost_subcontract + cost as total_cost  "\
        "    , sales "\
        "from "\
        "    t_fg_project_info  "\
        "    left join m_topic_info  "\
        "        on t_fg_project_info.order_detail = m_topic_info.order_detail  "\
        "where "\
        "    manage_id in (select fg_id from t_merge_target where fiscal_date = %s and version = %s) "\
        "order by "\
        "    t_fg_project_info.order_detail  "

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (yyyymm, version, ))
            return convertCursorToDict(cur)

# マージ結果（仕掛）
def _loadmerge_wip(yyyymm : str, version : str):
    sql = "select "\
        "      m_topic_info.project_nm "\
        "    , cost_labor "\
        "    , cost_subcontract "\
        "    , cost "\
        "    , cost_labor + cost_subcontract + cost as total_cost  "\
        "from "\
        "    t_wip_project_info  "\
        "    left join m_topic_info  "\
        "        on t_wip_project_info.order_detail = m_topic_info.order_detail  "\
        "where "\
        "    manage_id in (select wip_id from t_merge_target where fiscal_date = %s and version = %s) "\
        "order by "\
        "    t_wip_project_info.order_detail  "

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (yyyymm, version, ))
            return convertCursorToDict(cur)

def _loatmerge_perv_wip(yyyymm:str):
    sql = "select "\
        "      project_nm "\
        "    , cost_labor "\
        "    , cost_subcontract "\
        "    , cost  "\
        "from "\
        "    t_wip_info  "\
        "    left join m_topic_info  "\
        "        on t_wip_info.order_detail = m_topic_info.order_detail  "\
        "where "\
        "    fiscal_date = %s  "\
        "order by "\
        "    t_wip_info.order_detail "
    

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (_getPrevMonth(yyyymm), ))
            return convertCursorToDict(cur)

# マージ結果（HARMOS）
def _loadmerge_hrmos(yyyymm : str, version : str):
    sql = "select "\
        "      apply_no "\
        "    , apply_type "\
        "    , applicant "\
        "    , job_cd "\
        "    , cost "\
        "from "\
        "    t_hrmos_expense  "\
        "where "\
        "    manage_id in (select hrmos_id from t_merge_target where fiscal_date = %s and version = %s) "\
        "order by "\
        "    case "\
        "        when job_cd is null "\
        "            then 2 "\
        "        when job_cd = '' "\
        "            then 1 "\
        "        else 0 "\
        "        end "\
        "    , job_cd "\
        "    , apply_no "

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (yyyymm, version, ))
            return convertCursorToDict(cur)

# 勘定年月取得
def _getFiscalDate():
    # 前月末日を取得しその年月を文字列として返す
    today = datetime.datetime.today()
    thismonth = datetime.datetime(today.year, today.month, 1)
    lastmonth = thismonth + datetime.timedelta(days=-1)
    return lastmonth.strftime("%Y%m")

# 勘定年月取得
def _getFiscalDateByManageID(conn : any, manage_id : str):
    with conn.cursor() as cur:
        cur.execute(
            'select fiscal_date from m_file_info where manage_id = %s', (manage_id, ))
        res = cur.fetchone()
        if res is None:
            return ''
        return res[0]
    
# 前月取得
def _getPrevMonth(yyyymm : str):
    return (datetime.datetime.strptime(yyyymm, '%Y%m') + relativedelta(months=-1)).strftime("%Y%m")

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',port=5000)
