-- Project Name : SERP
-- Date/Time    : 2024/10/23 18:53:59
-- Author       : go.mukae
-- RDBMS Type   : PostgreSQL
-- Application  : A5:SQL Mk-2

-- マージ対象
drop table if exists t_merge_target cascade;

create table t_merge_target (
  FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , FG_ID character varying(23)
  , WIP_ID character varying(23)
  , HRMOS_ID character varying(23)
  , constraint t_merge_target_PKC primary key (FISCAL_DATE,VERSION)
) ;

-- 仕掛PJ台帳
drop table if exists T_WIP_PROJECT_INFO cascade;

create table T_WIP_PROJECT_INFO (
  MANAGE_ID character varying(23)
  , DIV_CD character varying(8)
  , ORDER_DETAIL character varying(12)
  , ORDER_ROWNO character varying(2)
  , CUSTOMER character varying(25)
  , COST_MATERIAL integer
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , constraint T_WIP_PROJECT_INFO_PKC primary key (MANAGE_ID,DIV_CD,ORDER_DETAIL,ORDER_ROWNO)
) ;

-- ファイル情報マスタ
drop table if exists M_FILE_INFO cascade;

create table M_FILE_INFO (
  MANAGE_ID character varying(23)
  , FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , FILE_DIV character varying(5)
  , FILE_NM character varying(25)
  , constraint M_FILE_INFO_PKC primary key (MANAGE_ID)
) ;

-- 仕掛情報テーブル
drop table if exists T_WIP_INFO cascade;

create table T_WIP_INFO (
  FISCAL_DATE character varying(6)
  , ORDER_DETAIL character varying(12)
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , constraint T_WIP_INFO_PKC primary key (FISCAL_DATE,ORDER_DETAIL)
) ;

-- 案件情報マスタ
drop table if exists M_TOPIC_INFO cascade;

create table M_TOPIC_INFO (
  ORDER_DETAIL character varying(12)
  , PROJECT_NM character varying(50)
  , constraint M_TOPIC_INFO_PKC primary key (ORDER_DETAIL)
) ;

-- マージ結果
drop table if exists T_MERGE_RESULT cascade;

create table T_MERGE_RESULT (
  FISCAL_DATE character varying(6)
  , VERSION character varying(2)
  , ORDER_DETAIL character varying(12)
  , FG_ID character varying(23)
  , WIP_ID character varying(23)
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , CHANGE_VALUE integer
  , PRODUCT_DIV character varying(2)
  , constraint T_MERGE_RESULT_PKC primary key (FISCAL_DATE,VERSION,ORDER_DETAIL)
) ;

-- HRMOS経費分原価
drop table if exists T_HRMOS_EXPENSE cascade;

create table T_HRMOS_EXPENSE (
  MANAGE_ID character varying(23)
  , APPLY_NO character varying(6)
  , APPLY_TYPE character varying(6)
  , APPLICANT character varying(6)
  , JOB_CD character varying(20)
  , COST integer
  , constraint T_HRMOS_EXPENSE_PKC primary key (MANAGE_ID,APPLY_NO)
) ;

-- 部門マスタ
drop table if exists M_DIV cascade;

create table M_DIV (
  DIV_CD character varying(8)
  , DIV_NM character varying(3)
  , constraint M_DIV_PKC primary key (DIV_CD)
) ;

-- 完成PJ台帳
drop table if exists T_FG_PROJECT_INFO cascade;

create table T_FG_PROJECT_INFO (
  MANAGE_ID character varying(23)
  , DIV_CD character varying(8)
  , ORDER_DETAIL character varying(12)
  , ORDER_ROWNO character varying(2)
  , CUSTOMER character varying(25)
  , COST_MATERIAL integer
  , COST_LABOR integer
  , COST_SUBCONTRACT integer
  , COST integer
  , SALES integer
  , constraint T_FG_PROJECT_INFO_PKC primary key (MANAGE_ID,DIV_CD,ORDER_DETAIL,ORDER_ROWNO)
) ;

comment on table t_merge_target is 'マージ対象';
comment on column t_merge_target.FISCAL_DATE is '勘定年月';
comment on column t_merge_target.VERSION is 'バージョン';
comment on column t_merge_target.FG_ID is '完成管理ID';
comment on column t_merge_target.WIP_ID is '仕掛管理ID';
comment on column t_merge_target.HRMOS_ID is '経費管理ID';

comment on table T_WIP_PROJECT_INFO is '仕掛PJ台帳';
comment on column T_WIP_PROJECT_INFO.MANAGE_ID is '管理ID';
comment on column T_WIP_PROJECT_INFO.DIV_CD is '原価部門コード';
comment on column T_WIP_PROJECT_INFO.ORDER_DETAIL is '受注明細';
comment on column T_WIP_PROJECT_INFO.ORDER_ROWNO is '受注行番号';
comment on column T_WIP_PROJECT_INFO.CUSTOMER is '得意先名';
comment on column T_WIP_PROJECT_INFO.COST_MATERIAL is '材料費';
comment on column T_WIP_PROJECT_INFO.COST_LABOR is '労務費';
comment on column T_WIP_PROJECT_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_WIP_PROJECT_INFO.COST is '経費';

comment on table M_FILE_INFO is 'ファイル情報マスタ';
comment on column M_FILE_INFO.MANAGE_ID is '管理ID';
comment on column M_FILE_INFO.FISCAL_DATE is '勘定年月';
comment on column M_FILE_INFO.VERSION is 'バージョン';
comment on column M_FILE_INFO.FILE_DIV is 'ファイル区分';
comment on column M_FILE_INFO.FILE_NM is 'ファイル名';

comment on table T_WIP_INFO is '仕掛情報テーブル';
comment on column T_WIP_INFO.FISCAL_DATE is '勘定年月';
comment on column T_WIP_INFO.ORDER_DETAIL is '受注明細';
comment on column T_WIP_INFO.COST_LABOR is '労務費';
comment on column T_WIP_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_WIP_INFO.COST is '経費';

comment on table M_TOPIC_INFO is '案件情報マスタ';
comment on column M_TOPIC_INFO.ORDER_DETAIL is '受注明細';
comment on column M_TOPIC_INFO.PROJECT_NM is '契約工事略名';

comment on table T_MERGE_RESULT is 'マージ結果';
comment on column T_MERGE_RESULT.FISCAL_DATE is '勘定年月';
comment on column T_MERGE_RESULT.VERSION is 'バージョン';
comment on column T_MERGE_RESULT.ORDER_DETAIL is '受注明細';
comment on column T_MERGE_RESULT.FG_ID is '完成管理ID';
comment on column T_MERGE_RESULT.WIP_ID is '仕掛管理ID';
comment on column T_MERGE_RESULT.COST_LABOR is '労務費';
comment on column T_MERGE_RESULT.COST_SUBCONTRACT is '外注費';
comment on column T_MERGE_RESULT.COST is '経費';
comment on column T_MERGE_RESULT.CHANGE_VALUE is '振替額';
comment on column T_MERGE_RESULT.PRODUCT_DIV is '完成仕掛区分';

comment on table T_HRMOS_EXPENSE is 'HRMOS経費分原価';
comment on column T_HRMOS_EXPENSE.MANAGE_ID is '管理ID';
comment on column T_HRMOS_EXPENSE.APPLY_NO is '申請No';
comment on column T_HRMOS_EXPENSE.APPLY_TYPE is '申請書';
comment on column T_HRMOS_EXPENSE.APPLICANT is '申請者';
comment on column T_HRMOS_EXPENSE.JOB_CD is 'TSジョブコード';
comment on column T_HRMOS_EXPENSE.COST is '経費';

comment on table M_DIV is '部門マスタ';
comment on column M_DIV.DIV_CD is '原価部門コード';
comment on column M_DIV.DIV_NM is '原価部門名';

comment on table T_FG_PROJECT_INFO is '完成PJ台帳';
comment on column T_FG_PROJECT_INFO.MANAGE_ID is '管理ID';
comment on column T_FG_PROJECT_INFO.DIV_CD is '原価部門コード';
comment on column T_FG_PROJECT_INFO.ORDER_DETAIL is '受注明細';
comment on column T_FG_PROJECT_INFO.ORDER_ROWNO is '受注行番号';
comment on column T_FG_PROJECT_INFO.CUSTOMER is '得意先名';
comment on column T_FG_PROJECT_INFO.COST_MATERIAL is '材料費';
comment on column T_FG_PROJECT_INFO.COST_LABOR is '労務費';
comment on column T_FG_PROJECT_INFO.COST_SUBCONTRACT is '外注費';
comment on column T_FG_PROJECT_INFO.COST is '経費';
comment on column T_FG_PROJECT_INFO.SALES is '売上高';

