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
  , modified_user bigint
  , modified_date timestamp with time zone
  , constraint m_div_pk primary key (div_cd)
) ;

comment on table m_div is '部門マスタ';
comment on column m_div.div_cd is '原価部門コード';
comment on column m_div.div_nm is '原価部門名';
comment on column m_div.modified_user is '更新者';
comment on column m_div.modified_date is '更新日時';

-- 案件情報マスタ
drop table if exists m_topic_info cascade;

create table m_topic_info (
  order_detail character varying(12)
  , order_rowno character varying(2)
  , project_nm character varying(50)
  , customer character varying(25)
  , group_id character varying(5)
  , disp_seq integer
  , del_flg character varying(1)
  , modified_user bigint
  , modified_date timestamp with time zone
  , constraint m_topic_info_pk primary key (order_detail, order_rowno)
) ;

comment on table m_topic_info is '案件情報マスタ';
comment on column m_topic_info.order_detail is '受注明細';
comment on column m_topic_info.order_rowno is '受注行番号';
comment on column m_topic_info.project_nm is '契約工事略名';
comment on column m_topic_info.project_nm is '得意先名';
comment on column m_topic_info.group_id is 'グループID';
comment on column m_topic_info.disp_seq is '表示順';
comment on column m_topic_info.del_flg is '削除フラグ';
comment on column m_topic_info.modified_user is '更新者';
comment on column m_topic_info.modified_date is '更新日時';

-- ファイル情報マスタ
drop table if exists m_file_info cascade;

create table m_file_info (
  manage_id character varying(23)
  , fiscal_date character varying(6)
  , version character varying(2)
  , file_div character varying(5)
  , file_nm character varying(25)
  , modified_user bigint
  , modified_date timestamp with time zone
  , constraint m_file_info_pk primary key (manage_id)
) ;

comment on table m_file_info is 'ファイル情報マスタ';
comment on column m_file_info.manage_id is '管理ID';
comment on column m_file_info.fiscal_date is '勘定年月';
comment on column m_file_info.version is 'バージョン';
comment on column m_file_info.file_div is 'ファイル区分';
comment on column m_file_info.file_nm is 'ファイル名';
comment on column m_file_info.modified_user is '更新者';
comment on column m_file_info.modified_date is '更新日時';

-- ユーザマスタ
drop table if exists m_users cascade;

create table m_users (
  id bigserial not null
  , azure_ad_id uuid not null
  , email character varying(255) not null
  , display_name character varying(100) not null
  , role_id int not null
  , last_login_at timestamp with time zone
  , created_at timestamp with time zone
  , updated_at timestamp with time zone
  , constraint m_users_pk primary key (id)
) ;

comment on table m_users is 'ユーザマスタ';
comment on column m_users.id is 'ID';
comment on column m_users.azure_ad_id is 'AzureID';
comment on column m_users.email is 'メールアドレス';
comment on column m_users.display_name is '表示名';
comment on column m_users.role_id is '権限ID';
comment on column m_users.last_login_at is '最終ログイン日時';
comment on column m_users.created_at is '作成日時';
comment on column m_users.updated_at is '変更日時';

-- 権限マスタ
drop table if exists m_role cascade;

create table m_role (
  role_id serial not null
  , role_name character varying(100) not null
  , role_desc character varying(255)
  , created_at timestamp with time zone
  , updated_at timestamp with time zone
  , constraint m_role_pk primary key (role_id)
) ;

comment on table m_role is '権限マスタ';
comment on column m_role.role_id is '権限ID';
comment on column m_role.role_name  is '権限名称';
comment on column m_role.role_desc is '権限説明';
comment on column m_role.created_at is '作成日時';
comment on column m_role.updated_at is '更新日時';

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
  , modified_user bigint
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
comment on column t_wip_project_info.modified_user is '更新者';
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
  , modified_user bigint
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
comment on column t_fg_project_info.modified_user is '更新者';
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
  , cost_other integer
  , modified_user bigint
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
comment on column t_wip_info.cost_other is 'その他';
comment on column t_wip_info.modified_user is '更新者';
comment on column t_wip_info.modified_date is '更新日時';

-- マージ対象
drop table if exists t_merge_target cascade;

create table t_merge_target (
  fiscal_date character varying(6)
  , version character varying(2)
  , fg_id character varying(23)
  , wip_id character varying(23)
  , modified_user bigint
  , modified_date timestamp with time zone
  , constraint t_merge_target_pk primary key (fiscal_date, version)
) ;

comment on table t_merge_target is 'マージ対象';
comment on column t_merge_target.fiscal_date is '勘定年月';
comment on column t_merge_target.version is 'バージョン';
comment on column t_merge_target.fg_id is '完成管理ID';
comment on column t_merge_target.wip_id is '仕掛管理ID';
comment on column t_merge_target.modified_user is '更新者';
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
  , cost_other integer
  , change_value integer
  , product_div character varying(2)
  , modified_user bigint
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
comment on column t_merge_result.cost_other is 'その他';
comment on column t_merge_result.change_value is '振替額';
comment on column t_merge_result.product_div is '完成仕掛区分';
comment on column t_merge_result.modified_user is '更新者';
comment on column t_merge_result.modified_date is '更新日時';
