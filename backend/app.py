import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

# SERP DB - PostgreSQL接続
def get_connection():
  return psycopg2.connect('postgresql://serp:serp@postgres:5432/serp')

#ファイルアップロード
@app.route("/serp/api/fileupload", method=["POST"])
def fileupload() :  
   return ""

#ファイル一覧
@app.route("/serp/api/filelist/<yyyymm>", method=["GET"])
def filelist(yyyymm : str) :
   return ""

#マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", method=["GET"])
def filemergelist(yyyymm : str) :
   return ""

#データ取得
@app.route("/serp/api/filedetail/<yyyymm>", method=["GET"])
def filedetail(yyyymm : str) :
   return ""

#マージ結果のデータ取得
@app.route("/serp/api/filemergedetail/<yyyymm>", method=["GET"])
def filemergedetail(yyyymm : str) :
   return ""

#ファイル削除
@app.route("/serp/api/filedelete/<fileid>", method=["DELETE"])
def filedelete(fileid : str) :
   return ""

#ファイル照合
@app.route("/serp/api/filematching", method=["PUT"])
def filematching() :
   return ""

#マージ要求
@app.route("/serp/api/filemerge", method=["PUT"])
def filemerge() :
   return ""

#ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>", method=["GET"])
def filedownload(yyyymm : str) :
   return ""

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
