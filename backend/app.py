import datetime
import shutil
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
import openpyxl
from copy import copy

app = Flask(__name__)
app.json.sort_keys = False
cors = CORS(app)

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

# ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload():
    return jsonify({"status": 0})

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
    return jsonify({"status":0, "result": _filemergelist(yyyymm)})
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
@app.route("/serp/api/filedelete/<fileid>", methods=["DELETE"])
def filedelete(manage_id: str):
    try:
        return jsonify({"status": 0, "result": _filedelete(manage_id)})
    except:
        return jsonify({"status": -1})
# ファイル照合
@app.route("/serp/api/filematching", methods=["PUT"])
def filematching():
    return jsonify({"status": 0, "result": "Oops!"})


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
@app.route("/serp/api/filedownload/<yyyymm>", methods=["GET"])
def filedownload(yyyymm: str):
    _filedownload(yyyymm)
    return jsonify({"status": 0})


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
                'select * from t_merge_result where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)

# データ取得
def _filedetail(manage_id: str):
    query = {
        'F': 'select * from t_fg_project_info where manage_id = %s',
        'W': 'select * from t_wip_project_info where manage_id = %s',
        'H': 'select * from t_hrmos_expense where manage_id = %s'
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
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_merge_result where fiscal_date = %s and version = %s', (yyyymm, version))
            return convertCursorToDict(cur)

# マージ要求
def _filemerge(manage_ids, fiscal_date):
    delete_result_sql = "delete from t_merge_result where fiscal_date = %s"
    delete_target_sql = "delete from t_merge_target where fiscal_date = %s"
    insert_target_sql = 'insert into t_merge_target (fiscal_date, fg_id, wip_id, hrmos_id) values (%s,%s,%s,%s)'

    merge_sql = \
    "insert into t_merge_result "\
    "with wip as ( "\
    "    select"\
    "          order_detail"\
    "        , sum(cost_labor) + sum(cost_subcontract) + sum(cost) as cost_wip "\
    "    from"\
    "        t_wip_info "\
    "    where"\
    "         fiscal_date < %s"\
    "    group by"\
    "        order_detail"\
    ") "\
    "select"\
    "      fiscal_date"\
    "    , version"\
    "    , t_fg_project_info.order_detail"\
    "    , t_fg_project_info.manage_id fg_id"\
    "    , null wip_id"\
    "    , cost_labor - coalesce(cost_wip, 0)   as cost_labor"\
    "    , cost_subcontract"\
    "    , cost"\
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
    "    , version"\
    "    , t_wip_project_info.order_detail"\
    "    , null fg_id"\
    "    , t_wip_project_info.manage_id wip_id"\
    "    , cost_labor - coalesce(cost_wip, 0)   as cost_labor"\
    "    , cost_subcontract"\
    "    , cost"\
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
        with conn.cursor() as cur:
            # 既存データを削除
            cur.execute(delete_result_sql, (fiscal_date,))
            cur.execute(delete_target_sql, (fiscal_date,))

            # マージ処理
            cur.execute(merge_sql, (fiscal_date, tuple(manage_ids),tuple(manage_ids),))

            # マージ対象ファイルIDを保存
            for manage_id in manage_ids:
                file_div = str(_getfilediv(conn,manage_id))
                match file_div:
                    case 'F':
                        fg = manage_id
                    case 'W':
                        wip = manage_id
                    case 'H':
                        hrmos = manage_id
            cur.execute(insert_target_sql, (fiscal_date,fg,wip,hrmos,))

def _filedownload(yyyymm : str):
    target_file = yyyymm + '.xlsx'

    shutil.copy('template.xlsx', target_file)
    wb = openpyxl.load_workbook(target_file)

    ws = wb.active
    ws.title = "サマリー・仕掛り" + yyyymm[4:6] + "月"

    # ヘッダ行
    ws.cell(1, 2, yyyymm[0:4] + "年" + yyyymm[4:6] + "月　仕掛 原価一覧")

    # サマリー
    result = _loadmerge(yyyymm)
    
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
    row += 1

    wb.save(target_file)

# マージ結果
def _loadmerge(yyyymm : str):
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
        "         fiscal_date < %s"\
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
        "    t_fg_project_info.manage_id in (select fg_id from t_merge_target where fiscal_date = %s) "\
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
        "    t_wip_project_info.manage_id in (select wip_id from t_merge_target where fiscal_date = %s)"\
        " order by order_detail"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql, (yyyymm, yyyymm, yyyymm, ))
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

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
