-- Project Name : SERP
-- Date/Time    : 2025/08/20
-- Author       : Naoya.Izumida
-- RDBMS Type   : PostgreSQL

-- 【マスタ】
-- 部門マスタ
drop table if exists m_div cascade;

create table m_div (
  div_cd character varying(8)
  , div_nm character varying(3)
  , modified_date timestamp with time zone 
  , constraint m_div_pk primary key (div_cd)
) ;

comment on table m_div is '部門マスタ';
comment on column m_div.div_cd is '原価部門コード';
comment on column m_div.div_nm is '原価部門名';
comment on column m_div.modified_date is '更新日時';

-- 案件情報マスタ
drop table if exists m_topic_info cascade;

create table m_topic_info (
  order_detail character varying(12)
  , order_rowno character varying(2)
  , project_nm character varying(50)
  , group_id character varying(2)
  , disp_seq integer
  , del_flg character varying(1)
  , modified_date timestamp with time zone
  , constraint m_topic_info_pk primary key (order_detail, order_rowno)
) ;

comment on table m_topic_info is '案件情報マスタ';
comment on column m_topic_info.order_detail is '受注明細';
comment on column m_topic_info.order_rowno is '受注行番号';
comment on column m_topic_info.project_nm is '契約工事略名';
comment on column m_topic_info.group_id is 'グループID';
comment on column m_topic_info.disp_seq is '表示順';
comment on column m_topic_info.del_flg is '削除フラグ';
comment on column m_topic_info.modified_date is '更新日時';

-- ファイル情報マスタ
drop table if exists m_file_info cascade;

create table m_file_info (
  manage_id character varying(23)
  , fiscal_date character varying(6)
  , version character varying(2)
  , file_div character varying(5)
  , file_nm character varying(25)
  , modified_date timestamp with time zone
  , constraint m_file_info_pk primary key (manage_id)
) ;

comment on table m_file_info is 'ファイル情報マスタ';
comment on column m_file_info.manage_id is '管理ID';
comment on column m_file_info.fiscal_date is '勘定年月';
comment on column m_file_info.version is 'バージョン';
comment on column m_file_info.file_div is 'ファイル区分';
comment on column m_file_info.file_nm is 'ファイル名';
comment on column m_file_info.modified_date is '更新日時';

-- 【トランザクション】
-- 仕掛pj台帳
drop table if exists t_wip_project_info cascade;

create table t_wip_project_info (
  manage_id character varying(23)
  , row_no integer
  , div_cd character varying(8)
  , order_detail character varying(12)
  , project_nm character varying(50)
  , order_rowno character varying(2)
  , customer character varying(25)
  , cost_material integer
  , cost_labor integer
  , cost_subcontract integer
  , cost integer
  , modified_date timestamp with time zone
  , constraint t_wip_project_info_pk primary key (manage_id, row_no, div_cd, order_detail, order_rowno)
) ;

comment on table t_wip_project_info is '仕掛pj台帳';
comment on column t_wip_project_info.manage_id is '管理ID';
comment on column t_wip_project_info.row_no is '行番号';
comment on column t_wip_project_info.div_cd is '原価部門コード';
comment on column t_wip_project_info.order_detail is '受注明細';
comment on column t_wip_project_info.order_rowno is '受注行番号';
comment on column t_wip_project_info.project_nm is '契約工事略名';
comment on column t_wip_project_info.customer is '得意先名';
comment on column t_wip_project_info.cost_material is '材料費';
comment on column t_wip_project_info.cost_labor is '労務費';
comment on column t_wip_project_info.cost_subcontract is '外注費';
comment on column t_wip_project_info.cost is '経費';
comment on column t_wip_project_info.modified_date is '更新日時';

-- 完成pj台帳
drop table if exists t_fg_project_info cascade;

create table t_fg_project_info (
  manage_id character varying(23)
  , row_no integer
  , div_cd character varying(8)
  , order_detail character varying(12)
  , order_rowno character varying(2)
  , project_nm character varying(50)
  , customer character varying(25)
  , cost_material integer
  , cost_labor integer
  , cost_subcontract integer
  , cost integer
  , sales integer
  , modified_date timestamp with time zone
  , constraint t_fg_project_info_pk primary key (manage_id, row_no, div_cd, order_detail, order_rowno)
) ;

comment on table t_fg_project_info is '完成pj台帳';
comment on column t_fg_project_info.manage_id is '管理ID';
comment on column t_fg_project_info.row_no is '行番号';
comment on column t_fg_project_info.div_cd is '原価部門コード';
comment on column t_fg_project_info.order_detail is '受注明細';
comment on column t_fg_project_info.order_rowno is '受注行番号';
comment on column t_fg_project_info.project_nm is '契約工事略名';
comment on column t_fg_project_info.customer is '得意先名';
comment on column t_fg_project_info.cost_material is '材料費';
comment on column t_fg_project_info.cost_labor is '労務費';
comment on column t_fg_project_info.cost_subcontract is '外注費';
comment on column t_fg_project_info.cost is '経費';
comment on column t_fg_project_info.sales is '売上高';
comment on column t_fg_project_info.modified_date is '更新日時';

-- 仕掛情報テーブル
drop table if exists t_wip_info cascade;

create table t_wip_info (
  fiscal_date character varying(6)
  , order_detail character varying(12)
  , order_rowno character varying(2)
  , cost_labor integer
  , cost_subcontract integer
  , cost integer
  , modified_date timestamp with time zone
  , constraint t_wip_info_pk primary key (fiscal_date, order_detail, order_rowno)
) ;

comment on table t_wip_info is '仕掛情報テーブル';
comment on column t_wip_info.fiscal_date is '勘定年月';
comment on column t_wip_info.order_detail is '受注明細';
comment on column t_wip_info.order_rowno is '受注行番号';
comment on column t_wip_info.cost_labor is '労務費';
comment on column t_wip_info.cost_subcontract is '外注費';
comment on column t_wip_info.cost is '経費';
comment on column t_wip_info.modified_date is '更新日時';

-- マージ対象
drop table if exists t_merge_target cascade;

create table t_merge_target (
  fiscal_date character varying(6)
  , version character varying(2)
  , fg_id character varying(23)
  , wip_id character varying(23)
  , modified_date timestamp with time zone
  , constraint t_merge_target_pk primary key (fiscal_date, version)
) ;

comment on table t_merge_target is 'マージ対象';
comment on column t_merge_target.fiscal_date is '勘定年月';
comment on column t_merge_target.version is 'バージョン';
comment on column t_merge_target.fg_id is '完成管理ID';
comment on column t_merge_target.wip_id is '仕掛管理ID';
comment on column t_merge_target.modified_date is '更新日時';

-- マージ結果
drop table if exists t_merge_result cascade;

create table t_merge_result (
  fiscal_date character varying(6)
  , version character varying(2)
  , order_detail character varying(12)
  , order_rowno character varying(2)
  , fg_id character varying(23)
  , wip_id character varying(23)
  , cost_labor integer
  , cost_subcontract integer
  , cost integer
  , change_value integer
  , product_div character varying(2)
  , modified_date timestamp with time zone
  , constraint t_merge_result_pk primary key (fiscal_date, version, order_detail, order_rowno)
) ;

comment on table t_merge_result is 'マージ結果';
comment on column t_merge_result.fiscal_date is '勘定年月';
comment on column t_merge_result.version is 'バージョン';
comment on column t_merge_result.order_detail is '受注明細';
comment on column t_merge_result.order_rowno is '受注行番号';
comment on column t_merge_result.fg_id is '完成管理ID';
comment on column t_merge_result.wip_id is '仕掛管理ID';
comment on column t_merge_result.cost_labor is '労務費';
comment on column t_merge_result.cost_subcontract is '外注費';
comment on column t_merge_result.cost is '経費';
comment on column t_merge_result.change_value is '振替額';
comment on column t_merge_result.product_div is '完成仕掛区分';
comment on column t_merge_result.modified_date is '更新日時';
