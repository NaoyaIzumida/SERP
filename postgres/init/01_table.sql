-- Project Name : SERP
-- Date/Time    : 2025/08/20
-- Author       : Naoya.Izumida
-- RDBMS Type   : PostgreSQL
-- Application  : A5:SQL Mk-2

-- 【マスタ】
-- 部門マスタ
drop table if exists M_DIV cascade;

create table M_DIV (
  DIV_CD character varying(8)
  , DIV_NM character varying(3)
  , MODIFIED_DATE Date
  , constraint M_DIV_PK primary key (DIV_CD)
) ;

comment on table M_DIV is '部門マスタ';
comment on column M_DIV.DIV_CD is '原価部門コード';
comment on column M_DIV.DIV_NM is '原価部門名';
comment on column M_DIV.MODIFIED_DATE is '更新日時';

-- 案件情報マスタ
drop table if exists M_TOPIC_INFO cascade;

create table M_TOPIC_INFO (
  ORDER_DETAIL character varying(12)
  , ORDER_ROWNO character varying(2)
  , PROJECT_NM character varying(50)
  , GROUP_ID character varying(2)
  , DISP_SEQ integer
  , MODIFIED_DATE Date
  , constraint M_TOPIC_INFO_PK primary key (ORDER_DETAIL, ORDER_ROWNO)
) ;

comment on table M_TOPIC_INFO is '案件情報マスタ';
comment on column M_TOPIC_INFO.ORDER_DETAIL is '受注明細';
comment on column M_TOPIC_INFO.ORDER_ROWNO is '受注行番号';
comment on column M_TOPIC_INFO.PROJECT_NM is '契約工事略名';
comment on column M_TOPIC_INFO.GROUP_ID is 'グループID';
comment on column M_TOPIC_INFO.DISP_SEQ is '表示順';
comment on column M_TOPIC_INFO.MODIFIED_DATE is '更新日時';

-- ファイル情報マスタ
drop table if exists M_FILE_INFO cascade;

create table M_FILE_INFO (
  MANAGE_ID character varying(23)
  , FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , FILE_DIV character varying(5)
  , FILE_NM character varying(25)
  , MODIFIED_DATE Date
  , constraint M_FILE_INFO_PK primary key (MANAGE_ID)
) ;

comment on table M_FILE_INFO is 'ファイル情報マスタ';
comment on column M_FILE_INFO.MANAGE_ID is '管理ID';
comment on column M_FILE_INFO.FISCAL_DATE is '勘定年月';
comment on column M_FILE_INFO.VERSION is 'バージョン';
comment on column M_FILE_INFO.FILE_DIV is 'ファイル区分';
comment on column M_FILE_INFO.FILE_NM is 'ファイル名';
comment on column M_FILE_INFO.MODIFIED_DATE is '更新日時';

-- 【トランザクション】
-- 仕掛PJ台帳
drop table if exists T_WIP_PROJECT_INFO cascade;

create table T_WIP_PROJECT_INFO (
  MANAGE_ID character varying(23)
  , ROW_NO integer
  , DIV_CD character varying(8)
  , ORDER_DETAIL character varying(12)
  , PROJECT_NM character varying(50)
  , ORDER_ROWNO character varying(2)
  , CUSTOMER character varying(25)
  , COST_MATERIAL integer
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , MODIFIED_DATE Date
  , constraint T_WIP_PROJECT_INFO_PK primary key (MANAGE_ID, ROW_NO, DIV_CD, ORDER_DETAIL, ORDER_ROWNO)
) ;

comment on table T_WIP_PROJECT_INFO is '仕掛PJ台帳';
comment on column T_WIP_PROJECT_INFO.MANAGE_ID is '管理ID';
comment on column T_WIP_PROJECT_INFO.ROW_NO is '行番号';
comment on column T_WIP_PROJECT_INFO.DIV_CD is '原価部門コード';
comment on column T_WIP_PROJECT_INFO.ORDER_DETAIL is '受注明細';
comment on column T_WIP_PROJECT_INFO.ORDER_ROWNO is '受注行番号';
comment on column T_WIP_PROJECT_INFO.PROJECT_NM is '契約工事略名';
comment on column T_WIP_PROJECT_INFO.CUSTOMER is '得意先名';
comment on column T_WIP_PROJECT_INFO.COST_MATERIAL is '材料費';
comment on column T_WIP_PROJECT_INFO.COST_LABOR is '労務費';
comment on column T_WIP_PROJECT_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_WIP_PROJECT_INFO.COST is '経費';
comment on column T_WIP_PROJECT_INFO.MODIFIED_DATE is '更新日時';

-- 完成PJ台帳
drop table if exists T_FG_PROJECT_INFO cascade;

create table T_FG_PROJECT_INFO (
  MANAGE_ID character varying(23)
  , ROW_NO integer
  , DIV_CD character varying(8)
  , ORDER_DETAIL character varying(12)
  , ORDER_ROWNO character varying(2)
  , PROJECT_NM character varying(50)
  , CUSTOMER character varying(25)
  , COST_MATERIAL integer
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , SALES integer
  , MODIFIED_DATE Date
  , constraint T_FG_PROJECT_INFO_PK primary key (MANAGE_ID, ROW_NO, DIV_CD, ORDER_DETAIL, ORDER_ROWNO)
) ;

comment on table T_FG_PROJECT_INFO is '完成PJ台帳';
comment on column T_FG_PROJECT_INFO.MANAGE_ID is '管理ID';
comment on column T_FG_PROJECT_INFO.ROW_NO is '行番号';
comment on column T_FG_PROJECT_INFO.DIV_CD is '原価部門コード';
comment on column T_FG_PROJECT_INFO.ORDER_DETAIL is '受注明細';
comment on column T_FG_PROJECT_INFO.ORDER_ROWNO is '受注行番号';
comment on column T_FG_PROJECT_INFO.PROJECT_NM is '契約工事略名';
comment on column T_FG_PROJECT_INFO.CUSTOMER is '得意先名';
comment on column T_FG_PROJECT_INFO.COST_MATERIAL is '材料費';
comment on column T_FG_PROJECT_INFO.COST_LABOR is '労務費';
comment on column T_FG_PROJECT_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_FG_PROJECT_INFO.COST is '経費';
comment on column T_FG_PROJECT_INFO.SALES is '売上高';
comment on column T_FG_PROJECT_INFO.MODIFIED_DATE is '更新日時';

-- 仕掛情報テーブル
drop table if exists T_WIP_INFO cascade;

create table T_WIP_INFO (
  FISCAL_DATE character varying(6)
  , ORDER_DETAIL character varying(12)
  , ORDER_ROWNO character varying(2)
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , MODIFIED_DATE Date
  , constraint T_WIP_INFO_PK primary key (FISCAL_DATE, ORDER_DETAIL, ORDER_ROWNO)
) ;

comment on table T_WIP_INFO is '仕掛情報テーブル';
comment on column T_WIP_INFO.FISCAL_DATE is '勘定年月';
comment on column T_WIP_INFO.ORDER_DETAIL is '受注明細';
comment on column T_WIP_INFO.ORDER_ROWNO is '受注行番号';
comment on column T_WIP_INFO.COST_LABOR is '労務費';
comment on column T_WIP_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_WIP_INFO.COST is '経費';
comment on column T_WIP_INFO.MODIFIED_DATE is '更新日時';

-- マージ対象
drop table if exists T_MERGE_TARGET cascade;

create table T_MERGE_TARGET (
  FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , FG_ID character varying(23)
  , WIP_ID character varying(23)
  , HRMOS_ID character varying(23)
  , MODIFIED_DATE Date
  , constraint T_MERGE_TARGET_PK primary key (FISCAL_DATE, VERSION)
) ;

comment on table T_MERGE_TARGET is 'マージ対象';
comment on column T_MERGE_TARGET.FISCAL_DATE is '勘定年月';
comment on column T_MERGE_TARGET.VERSION is 'バージョン';
comment on column T_MERGE_TARGET.FG_ID is '完成管理ID';
comment on column T_MERGE_TARGET.WIP_ID is '仕掛管理ID';
comment on column T_MERGE_TARGET.HRMOS_ID is '経費管理ID';
comment on column T_MERGE_TARGET.MODIFIED_DATE is '更新日時';

-- マージ結果
drop table if exists T_MERGE_RESULT cascade;

create table T_MERGE_RESULT (
  FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , ORDER_DETAIL character varying(12)
  , ROW_NO integer
  , FG_ID character varying(23)
  , WIP_ID character varying(23)
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , CHANGE_VALUE integer
  , PRODUCT_DIV character varying(2)
  , MODIFIED_DATE Date
  , constraint T_MERGE_RESULT_PK primary key (FISCAL_DATE, VERSION, ORDER_DETAIL, ROW_NO)
) ;

comment on table T_MERGE_RESULT is 'マージ結果';
comment on column T_MERGE_RESULT.FISCAL_DATE is '勘定年月';
comment on column T_MERGE_RESULT.VERSION is 'バージョン';
comment on column T_MERGE_RESULT.ORDER_DETAIL is '受注明細';
comment on column T_MERGE_RESULT.ROW_NO is '行番号';
comment on column T_MERGE_RESULT.FG_ID is '完成管理ID';
comment on column T_MERGE_RESULT.WIP_ID is '仕掛管理ID';
comment on column T_MERGE_RESULT.COST_LABOR is '労務費';
comment on column T_MERGE_RESULT.COST_SUBCONTRACT is '外注費';
comment on column T_MERGE_RESULT.COST is '経費';
comment on column T_MERGE_RESULT.CHANGE_VALUE is '振替額';
comment on column T_MERGE_RESULT.PRODUCT_DIV is '完成仕掛区分';
comment on column T_MERGE_RESULT.MODIFIED_DATE is '行番号';