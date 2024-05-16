import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS

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

#ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload() :  
   return jsonify({"status":0})

#API No.2 ファイル一覧
@app.route("/serp/api/filelist/<yyyymm>", methods=["GET"])
def filelist(yyyymm : str) :
#    return jsonify({"status":0, "result":convertCursorToJSON(filelist(yyyymm))})
   return jsonify({"status":0, "result":filelist(yyyymm)})

#マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", methods=["GET"])
def filemergelist(yyyymm : str) :
   return jsonify({"status":0})

#API No.4 データ取得
@app.route("/serp/api/filedetail/<manage_id>", methods=["GET"])
def filedetail(manage_id : str) :
   return jsonify({"status":0, "result":filedetail(manage_id)})

#マージ結果のデータ取得
@app.route("/serp/api/filemergedetail/<yyyymm>", methods=["GET"])
def filemergedetail(yyyymm : str) :
   return jsonify({"status":0, "result":"Oops!"})

#ファイル削除
@app.route("/serp/api/filedelete/<fileid>", methods=["DELETE"])
def filedelete(fileid : str) :
   return jsonify({"status":0})

#ファイル照合
@app.route("/serp/api/filematching", methods=["PUT"])
def filematching() :
   return jsonify({"status":0, "result":"Oops!"})

#マージ要求
@app.route("/serp/api/filemerge", methods=["PUT"])
def filemerge() :
   return jsonify({"status":0})

#ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>", methods=["GET"])
def filedownload(yyyymm : str) :
   return jsonify({"status":0})


# 仕掛情報テーブルから勘定年月を指定して取得
def filelist(yyyymm : str):
  with get_connection() as conn:
    with conn.cursor() as cur:
      cur.execute('select * from t_wip_info where fiscal_date = %s', (yyyymm, ))
      return convertCursorToDict(cur)

# データ取得
def filedetail(manage_id : str):
   with get_connection() as conn:
    with conn.cursor() as cur:
      cur.execute('select file_div from m_file_info where manage_id = %s', (manage_id, ))
      if cur == 'F':
         cur.execute('select * from t_fg_project_info where manage_id = %s', (manage_id, ))
      elif cur == 'W':
         cur.execute('select * from t_wip_project_info where manage_id = %s', (manage_id, ))
      else:
         cur.execute('select * from t_hrmos_expense where manage_id = %s', (manage_id, ))
      return convertCursorToDict(cur)


# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
