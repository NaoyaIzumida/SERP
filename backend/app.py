import psycopg2
from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
import pandas as pd
from sqlalchemy import create_engine

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

POSTGRES_USER = 'serp'
POSTGRES_PASSWORD = 'serp'
POSTGRES_DB = 'serp'
POSTGRES_HOST = 'postgres'
POSTGRES_PORT = '5432'

# PostgreSQLへの接続エンジンを作成
db_url = ('postgresql://serp:serp@postgres:5432/serp')
engine = create_engine(db_url)

# Excelファイルの列とテーブルのカラムのマッピング
column_mapping = {
    'manage_id': '管理ID',
    'div_cd': '原価部門コード',
    'order_detail': '受注明細+受注行番号+部門コード',
    'order_rowno': '受注明細+受注行番号+部門コード',
    'customer': '得意先名',
    'cost_material': '材料費',
    'cost_labor': '労務費',
    'cost_subconstract': '外注費',
    'cost': '経費'
}

# API No.1ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload():
    try:
        result = _fileupload()
        if result == 'upload OK.':
            return jsonify({"status":0})
        else:
            return jsonify({"status":1})
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

# ファイル削除
@app.route("/serp/api/filedelete/<fileid>", methods=["DELETE"])
def filedelete(fileid: str):
    return jsonify({"status": 0})

# ファイル照合
@app.route("/serp/api/filematching", methods=["PUT"])
def filematching():
    return jsonify({"status": 0, "result": "Oops!"})

# マージ要求
@app.route("/serp/api/filemerge", methods=["PUT"])
def filemerge():
    return jsonify({"status": 0})

# ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>", methods=["GET"])
def filedownload(yyyymm: str):
    return jsonify({"status": 0})

# ファイルアップロード
def _fileupload():
    # リクエストパラメータの受取
    fiscal_date = request.form["fiscal_date"]
    file_nm = request.form["file_nm"]
    file_div = request.form["file_div"]

    # ファイル情報マスタ登録
    with get_connection() as conn:
        _insertFileInfo(conn, fiscal_date, file_div, file_nm)

    # エラーチェック
    if 'uploadFile' not in request.files:
        return make_response(jsonify({'result':'uploadFile is required.'}))

    file = request.files['uploadFile']
    fileName = file.filename
    if '' == fileName:
        return make_response(jsonify({'result':'filename must not empty.'}))

    # ファイル読込
    df = pd.read_excel(file, sheet_name=0, skipfooter=1, skiprows=1)
    
    for index, data in df.iterrows():
        div_cd = data[0]    #原価部門コード
        orders = str(data[2]).split('-') #原価部門コード
        order_detail = orders[0]            
        order_rowno = orders[1]
        project_nm = data[3]
        customer = data[4]
        cost_material = data[5]
        cost_labor = data[6]
        cost_subcontract = data[7]
        cost = data[8]
        sales = data[9]
            
        with get_connection() as conn:
            match file_div:
                case "F":
                    _insertFgFileInfo(conn, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost, sales)
                case "W":
                    _insertWipFileInfo(conn, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost)
            
            _insertTopicInfo(conn, order_detail, project_nm)

    return 'upload OK.'

# 新規管理ID採番
def _getNextManageID(conn : any):
    with conn.cursor() as cur:
        cur.execute(
            "select cast(max(cast(manage_id as numeric)) + 1 as varchar(23)) as manage_id from m_file_info")
        res = cur.fetchone()
        if res is None:
            return '1'
        return res[0]

# 新規バージョン採番
def _getNextVersion(conn : any, fiscal_date : str, file_div : str):
    with conn.cursor() as cur:
        cur.execute(
            "select coalesce(cast(max(cast(version as numeric)) + 1 as varchar(2)), '0') as version from m_file_info where fiscal_date = %s and file_div = %s", (fiscal_date, file_div))
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

# 完成PJ台帳登録
def _insertFgFileInfo(conn : any, div_cd : str, order_detail : str, order_rowno : str, customer : str, cost_material : str, cost_labor : str, cost_subcontract : str, cost : str, sales : str):
    manage_id = _getNextManageID(conn)
 
    with conn.cursor() as cur:
        cur.execute("insert into t_fg_project_info (manage_id,div_cd,order_detail,order_rowno,customer,cost_material,cost_labor,cost_subcontract,cost,sales) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (manage_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost, sales))
   
    return None

# 仕掛PJ台帳登録
def _insertWipFileInfo(conn : any, div_cd : str, order_detail : str, order_rowno : str, customer : str, cost_material : str, cost_labor : str, cost_subcontract : str, cost : str):
    manage_id = _getNextManageID(conn)
 
    with conn.cursor() as cur:
        cur.execute("insert into t_wip_project_info (manage_id,div_cd,order_detail,order_rowno,customer,cost_material,cost_labor,cost_subcontract,cost) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (manage_id, div_cd, order_detail, order_rowno, customer, cost_material, cost_labor, cost_subcontract, cost))
   
    return None

# 案件情報登録
def _insertTopicInfo(conn : any, order_detail : str, project_nm : str):
    with conn.cursor() as cur:
        cur.execute("insert into m_topic_info (order_detail,project_nm) values (%s, %s)", (order_detail, project_nm))
        return None

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

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
