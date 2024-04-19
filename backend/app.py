import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

# SERP DB - PostgreSQL接続
def get_connection():
  return psycopg2.connect('postgresql://serp:serp@postgres:5432/serp')

#ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload() :  
   return jsonify({"status":0})

#ファイル一覧
@app.route("/serp/api/filelist/<yyyymm>", methods=["GET"])
def filelist(yyyymm : str) :
   return jsonify({"status":0, "result":filelist(yyyymm)})

#マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", methods=["GET"])
def filemergelist(yyyymm : str) :
   return jsonify({"status":0})

#データ取得
@app.route("/serp/api/filedetail/<yyyymm>", methods=["GET"])
def filedetail(yyyymm : str) :
   return jsonify({"status":0})

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
      return cur.fetchall()


# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)