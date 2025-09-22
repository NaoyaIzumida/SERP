delete from m_div;
insert into m_div(div_cd, div_nm, modified_date) values 
 ('14000100', '技術部', current_timestamp)
;

delete from m_topic_info;
insert into m_topic_info(order_detail, order_rowno, project_nm, del_flg, modified_date) values 
 ('ZAB202300064', '1', '【AE0172420】AFP,ACSｼｽﾃﾑｻﾎﾟｰﾄ2024上期', '0', current_timestamp)
,('ZAB202300095', '2', '【AE0174795】KJ様　ｻｰﾊﾞｰﾒﾝﾃﾅﾝｽ手順書作成', '0', current_timestamp)
,('ZAB202300099', '1', '【AE0174850】調合原材料天秤計量ｼｽﾃﾑ追加', '0', current_timestamp)
;

delete from t_wip_info;
insert into t_wip_info(fiscal_date, order_detail, order_rowno, cost_labor, cost_subcontract, cost, modified_date) values 
 ('202408', 'ZAB202300064', '1', 200366, 0, 0, current_timestamp)
,('202408', 'ZAB202300095', '1', 64330, 0, 0, current_timestamp)
,('202408', 'ZAB202300099', '1', 119248, 0, 0, current_timestamp)
;

delete from m_file_info;
delete from t_wip_project_info;
delete from t_fg_project_info;
delete from t_merge_target;
delete from t_merge_result;
