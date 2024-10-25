--delete from m_div;
insert into m_div(div_cd,div_nm) values 
 ('14000100','技術部')
;

--delete from m_topic_info;
insert into m_topic_info(order_detail,project_nm) values 
 ('ZAB202300064','【AE0172420】AFP,ACSｼｽﾃﾑｻﾎﾟｰﾄ2024上期')
,('ZAB202300095','【AE0174795】KJ様　ｻｰﾊﾞｰﾒﾝﾃﾅﾝｽ手順書作成')
,('ZAB202300099','【AE0174850】調合原材料天秤計量ｼｽﾃﾑ追加')
;

--delete from t_wip_info;
insert into t_wip_info(fiscal_date,order_detail,cost_labor,cost_subcontract,cost) values 
 ('202408','ZAB202300064',200366,0,0)
,('202408','ZAB202300095',64330,0,0)
,('202408','ZAB202300099',119248,0,0)
;

/*
delete from m_file_info;
delete from t_fg_project_info;
delete from t_wip_project_info;
delete from t_hrmos_expense;
delete from t_merge_result;
delete from t_merge_target;
*/
