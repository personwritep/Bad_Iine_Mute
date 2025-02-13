// ==UserScript==
// @name        Bad Iine Mute
// @namespace        http://tampermonkey.net/
// @version        4.1
// @description        「管理画面」から不良な「いいね！」を非表示にする
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/top*
// @match        https://blog.ameba.jp/ucs/iine/list.html*
// @match        https://ameblo.jp/*
// @exclude        https://ameblo.jp/*/image*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @noframes
// @grant        none
// @updateURL        https://github.com/personwritep/Bad_Iine_Mute/raw/main/Bad_Iine_Mute.user.js
// @downloadURL        https://github.com/personwritep/Bad_Iine_Mute/raw/main/Bad_Iine_Mute.user.js
// ==/UserScript==


let iine_block_data={}; // 総合ブロックデータ
let iine_block_id=[];
let iine_block_img=[];
let block_filter_id;
let block_regex_id;
let block_filter_img;
let block_regex_img;
let edit_mode=0;


let ua=0;
let agent=window.navigator.userAgent.toLowerCase();
if(agent.indexOf('firefox') > -1){ ua=1; } // Firefoxの場合のフラッグ


let read_json=localStorage.getItem('iine_id_back'); // ローカルストレージ 保存名
iine_block_data=JSON.parse(read_json);
if(iine_block_data==null){
    iine_block_data=[['tmp1', 'img1'], ['tmp2', 'img2']];
    write_local(); }


reg_set();

function reg_set(){
    iine_block_id=[];
    iine_block_img=[];
    for(let k=0; k<iine_block_data.length; k++){
        iine_block_id[k]=iine_block_data[k][0];
        iine_block_img[k]=iine_block_data[k][1]; }
    block_filter_id=iine_block_id.join('|');
    block_regex_id=RegExp(block_filter_id);
    block_filter_img=iine_block_img.join('|');
    block_regex_img=RegExp(block_filter_img); }



let svg_path=
    '<path d="M35 1C19 3 6 15 1 31C-2 46 0 64 0 79L0 170C0 '+
    '188 -3 208 8 223C21 241 40 240 60 240L156 240C172 240 189 242 205 '+
    '240C221 236 234 225 239 209C243 195 240 177 240 162L240 68C240 51 '+
    '243 31 232 16C218 -2 198 0 178 0L83 0C67 0 50 -2 35 0z"/>'+
    '<path style="fill:#fff" d="M39 6C24 9 11 18 8 33C4 48 6 65 6 80L6 169C6 '+
    '186 3 206 14 220C26 236 46 234 64 234L156 234C172 234 189 236 205 '+
    '233C221 230 231 217 234 202C236 188 234 172 234 158L234 71C234 54 '+
    '237 33 226 19C213 4 193 6 175 6L85 6C70 6 54 4 39 6z"/>'+
    '<path d="M44 214C83 214 123 212 161 202C181 197 '+
    '201 189 213 171C222 157 223 134 213 119C201 101 173 92 153 102C153 '+
    '81 147 59 132 43C106 17 58 11 36 45C27 58 25 75 24 90C21 122 28 156 '+
    '36 187C38 196 42 205 44 214z"/>'+
    '<path style="fill:#fff" d="M67 84C58 86 53 97 59 105C63 110 70 112 76 '+
    '110C95 105 85 79 67 84M101 86L101 196C107 196 114 194 120 194L120 '+
    '181C124 185 128 188 133 190C137 191 140 191 144 191C173 189 181 153 '+
    '175 130C170 113 156 103 139 109C133 111 128 115 124 119L124 83C116 '+
    '83 109 86 101 86M60 124L60 203C67 203 74 201 81 200L81 121C74 122 '+
    '67 124 60 124z"/>'+
    '<path d="M136 125C121 129 120 152 124 164C126 171 '+
    '134 178 142 175C157 171 159 150 155 137C153 128 145 122 136 125z"/>';

let svg_mark_t=
    '<svg class="svgm_t" width="24" height="24" viewBox="0 0 240 240" '+
    'style="margin: -7px 6px; cursor: pointer;">'+ svg_path +'</svg>';

let svg_mark_d=
    '<svg class="svgm_d" width="24" height="24" viewBox="0 0 240 240" '+
    'style="position: absolute; top: 7px; left: 12px; cursor: pointer;">'+ svg_path +
    '</svg>';

let svg_mark_dn=
    '<svg class="svgm_d" width="24" height="24" viewBox="0 0 240 240" '+
    'style="position: static; flex-shrink: 0; cursor: pointer;">'+ svg_path +
    '</svg>';

let svg_mark_h=
    '<svg fill="#2196f3" width="18" height="18" viewBox="0 0 240 240" '+
    'style="margin: -4px 0px">'+ svg_path +'</svg>';



// ==========  Bad Iine Mute ===============================


if(document.domain.includes('blog.ameba')){
    let find_img_src='';

    let target0=document.head; // 監視 target
    let monitor0=new MutationObserver(mode_select);
    monitor0.observe(target0, { childList: true }); // 監視開始

    mode_select();

    function mode_select(){

        if(document.querySelector('#iineEntry')){ // 管理トップ
            let iine_title=document.querySelector('h2.iineEntry__heading');
            iine_title.innerHTML=svg_mark_t+'　いいねされた記事';
            title_disp(iine_title, iine_title);

            iine_title.onclick=function(event){
                event.preventDefault();
                if(event.altKey==true){ //「Altキー ＋ 左クリック」
                    if(edit_mode==0){
                        edit_mode=1;
                        file_backup(); } // ファイル保存 管理トップ
                    else{
                        edit_mode=0;
                        file_backup_end(); }}
                else{
                    if(edit_mode==0){
                        edit_mode=1; }
                    else if(edit_mode==1){
                        edit_mode=0;
                        file_backup_end(); }}
                blocker();
                title_disp(iine_title, iine_title); }}


        if(document.querySelector('#iineHistoryEntryFrame')){ // 履歴 タブ1

            let iine_title=document.querySelector('#iineHistoryEntryFrame .ttl');
            let iine_th=document.querySelectorAll('#iineHistoryEntryFrame th');
            iine_th[0].innerHTML=svg_mark_t +'　いいね！された記事';
            title_disp(iine_th[0], iine_th[1]);
            disp_help();
            end_more_r('#iineHistoryEntryFrame', '#moreEntryLink');

            iine_title.onclick=function(event){
                event.preventDefault();
                if(event.altKey==true){ //「Altキー ＋ 左クリック」
                    if(edit_mode==0){
                        edit_mode=1;
                        file_backup(); } // ファイル保存 履歴タブ1
                    else{
                        edit_mode=0;
                        file_backup_end();
                        find_user_end(); }}
                else if(event.ctrlKey==true){ //「Ctrlキー ＋ 左クリック」
                    if(edit_mode==0){
                        edit_mode=2;
                        find_user(); } // ユーザー履歴検索 履歴タブ1
                    else{
                        edit_mode=0;
                        file_backup_end();
                        find_user_end(); }}
                else{
                    if(edit_mode==0){
                        edit_mode=1; }
                    else if(edit_mode==1){
                        edit_mode=0;
                        file_backup_end(); }
                    else if(edit_mode==2){
                        edit_mode=0;
                        find_user_end(); }}
                title_disp(iine_th[0], iine_th[1]);
                blocker(); }}


        if(document.querySelector('#iineHistoryUserFrame')){ // 履歴 タブ2

            let iine_title=document.querySelector('#iineHistoryContent tr:first-child');
            let iine_th=document.querySelectorAll('#iineHistoryUserFrame th');
            iine_th[0].innerHTML=
                '　　　　　　　　　　'+ svg_mark_t +
                '　ユーザー名 / ブログ名  　 　　Sift+Click : ソート';
            iine_th[0].style.textIndent='-20em';
            iine_th[0].style.overflow='hidden';
            title_disp(iine_th[0], iine_th[1]);
            disp_help();
            end_more_r('#iineHistoryUserFrame', '#moreUserLink');

            iine_title.onclick=function(event){
                event.preventDefault();
                if(event.ctrlKey==true){ //「Ctrlキー ＋ 左クリック」
                    if(edit_mode==0 || edit_mode==1){
                        edit_mode=2;
                        find_user(); }
                    else{
                        edit_mode=0
                        find_user_end(); }}
                else if(event.shiftKey==true){ //「Shiftキー ＋ 左クリック」
                    edit_mode=0;
                    find_user_end();
                    sort(); }
                else{
                    if(edit_mode==0){
                        edit_mode=1; }
                    else{
                        edit_mode=0;
                        find_user_end(); }}
                title_disp(iine_th[0], iine_th[1]);
                blocker(); }}

    } // mode_select()



    function title_disp(th0, th1){
        let svgm_t=document.querySelector('.svgm_t');
        let more=document.querySelector('.iineEntry__pageLink');
        if(svgm_t){
            th0.style.whiteSpace='nowrap';
            if(edit_mode==0){
                th0.style.boxShadow='none';
                th1.style.boxShadow='none';
                th0.style.color='#666';
                th1.style.color='#666';
                svgm_t.style.fill='#2196f3';
                if(more){
                    more.style.filter='brightness(1)'; }}
            else if(edit_mode==1){
                th0.style.boxShadow='inset 0 0 0 30px red';
                th1.style.boxShadow='inset 0 0 0 30px red';
                th0.style.color='#fff';
                th1.style.color='#fff';
                svgm_t.style.fill='red';
                if(more){
                    more.style.filter='brightness(50)'; }}
            else if(edit_mode==2){
                th0.style.boxShadow='inset 0 0 0 30px #2196f3';
                th1.style.boxShadow='inset 0 0 0 30px #2196f3';
                th0.style.color='#fff';
                th1.style.color='#fff';
                svgm_t.style.fill='#2196f3'; }}}



    function end_more_r(scroll_box, button){
        let senser=0;
        let next=0;
        let interval;

        let list_frame=document.querySelector('#iineHistoryContent');
        if(list_frame){
            let style=
                '<style id="imute_style_r">'+
                '#iineHistoryContent table { position: relative; } '+
                '#iineHistoryContent tbody { overflow-y: scroll; margin-top: 34px; '+
                'height: calc( 100vh - 220px); border-bottom: 1px solid #ccc; display: block; } '+
                '.tableList th { width: inherit; font-size: 14px; padding: 8px 4px 6px; '+
                'text-align: center !important; background: #f4f4f4; } '+
                '#iineHistoryContent tr:first-child { position: absolute; z-index: 1; width: 786px; '+
                'top: 1px; left: -1px; border-left: 1px solid #ccc; border-right: 1px solid #ccc; } '+
                '#ucsMain #moreLoading { margin: -3px auto; } '+
                '#iineHistoryUserFrame .tableList th.rightCell { width: 200px; } '+
                '#ucsMain .moreLinkBottom span { '+
                'background-position: 0 4px; font-size: 14px; } '+
                '#iineHistoryEntryFrame:after, #iineHistoryUserFrame:after { '+
                'content: "▢ Space: 連続スクロール / 停止"; '+
                'position: absolute; right: 10px; margin: 0; border: 1px solid #aaa; '+
                'padding: 3px 12px 1px; font: bold 14px Meiryo; color: #888; background: #fff; } ' +
                '#footerAd, #globalFooter { display: none; }'+
                '</style>';

            if(!list_frame.querySelector('#imute_style_r')){
                list_frame.insertAdjacentHTML('beforeend', style); }}


        monitor0.disconnect();
        let more=document.querySelector(button);
        let item=document.querySelectorAll(scroll_box +' tr');
        if(more && item.length<18){ // リストを18行まで自動で開く 🔴
            more.click(); }
        monitor0.observe(target0, {childList: true, subtree: true});


        document.addEventListener('keydown', function(event){
            if(document.querySelector('#iineHistoryEntryFrame')){
                auto_scroll(event, '#iineHistoryEntryFrame', '#moreEntryLink'); }
            else if(document.querySelector('#iineHistoryUserFrame')){
                auto_scroll(event, '#iineHistoryUserFrame', '#moreUserLink'); }});

        function auto_scroll(event, ascroll_box, abutton){
            if(event.keyCode==32){
                event.preventDefault();
                if(active_check()){
                    event.stopImmediatePropagation(); }

                if(next==0 && active_check()){
                    next=1;
                    interval=setInterval(
                        function(){
                            go();
                            stop();
                            senser+=1;
                        }, 500); }
                else{
                    next=0;
                    clearInterval(interval); }

                setTimeout(()=>{
                    view_end();}, 600); } // リスト末尾を表示


            function go(){
                let more=document.querySelector(abutton); // Moreボタン
                if(more && next==1 && active_check()){
                    monitor0.disconnect();
                    more.click();
                    view_end();
                    senser=0;
                    monitor0.observe(target0, {childList: true, subtree: true}); }}

            function stop(){
                if(senser>8){
                    next=0;
                    senser=0;
                    clearInterval(interval);
                    view_end(); }}

            function view_end(){
                let list_body=document.querySelector(ascroll_box +' tbody');
                if(list_body && active_check()){
                    list_body.scrollBy(0, 1000); }}

            function active_check(){
                let iine_Mask=document.querySelector('#iineEntryListMask');
                let mask=window.getComputedStyle(iine_Mask).getPropertyValue('display');
                if(mask=='block'){
                    return false; }
                else{
                    return true; }}

        } // auto_scroll()
    } //end_more_r()



    function sort(){
        window.getSelection().removeAllRanges();

        let iine_arr=[];

        let iine_tr=document.querySelectorAll('#iineHistoryUserFrame tr');
        for(let k=1; k<iine_tr.length; k++){
            let user_href;
            let user_name;
            let user_count;
            let user_src=iine_tr[k].querySelector('.list_img img').getAttribute('src');
            if(iine_tr[k].querySelector('.heading a')){
                user_href=iine_tr[k].querySelector('.heading a').getAttribute('href');
                user_name=iine_tr[k].querySelector('.heading a span').textContent;
                user_count=parseInt(
                    iine_tr[k].querySelector('.iineCnt').textContent.replace(/[^0-9]/g, ''), 10); }
            else{ // 退会ユーザー
                user_href='---';
                user_name='---';
                user_count=0; }

            iine_arr.push([user_src, user_href, user_name, user_count]); } // データの配列化


        iine_arr.sort((a, b)=>{
            return b[b.length-1] - a[a.length-1] }) // user_count の降順にソート


        let iine_table=document.querySelector('#iineHistoryUserFrame tbody');
        let iine_r_tr=iine_table.querySelectorAll('tr');
        for(let k=1; k<iine_r_tr.length; k++){
            iine_r_tr[k].remove(); }


        for(let k=0; k<iine_arr.length; k++){
            let iine_tr=
                '<tr>'+
                '<td><b class="list_img"><img src="'+ iine_arr[k][0] +'"></b>'+
                '<div class="list_main"><div class="heading"><a href="'+ iine_arr[k][1] +'">'+
                '<span>'+ iine_arr[k][2] +'</span></a>'+
                '</div></div></td><td class="iineCnt">'+ iine_arr[k][3] +'</td>'+
                '</tr>';

            if(iine_table.childElementCount<iine_r_tr.length){
                iine_table.insertAdjacentHTML('beforeend', iine_tr); }} // 配列のtableへの再配置

    } // sort()



    function disp_help(){
        let page_title=document.querySelector('#ucsMainLeft h1');
        if(page_title){
            let help=
                '<span id="imute_help">'+
                'Click '+ svg_mark_h +' : ブロック設定　　'+
                'Alt+Click '+ svg_mark_h +' : データ保存　　'+
                'Ctrl+Click '+svg_mark_h +' : ユーザー検索　　'+
                '<span class="imute_help_link">？</span>'+
                '<style>'+
                '#imute_help { font: bold 14px Meiryo; float: right; padding: 2px 6px 0; '+
                'font: bold 14px Meiryo; float: right; padding: 2px 6px 0; '+
                'border: 1px solid #aaa; color: #888; } '+
                '.imute_help_link { display: inline-block; height: 16px; line-height: 17px; '+
                'padding: 0 1px; color: #fff; background: #0771cd; '+
                'border-radius: 20px; cursor: pointer; }'+
                '</style></span>';

            if(!document.querySelector('#imute_help')){
                page_title.insertAdjacentHTML('beforeend', help); }

            let imute_help_link=document.querySelector('.imute_help_link');
            imute_help_link.onclick=function(){
                let url='https://ameblo.jp/personwritep/entry-12706813325.html';
                window.open(url, '_blank'); }

        }} // disp_help()



    //== blocker ==

    let target1=document.head; // 監視 target
    let monitor1=new MutationObserver(blocker);
    monitor1.observe(target1, { childList: true }); // 監視開始

    function blocker(){
        reg_set();

        if(document.querySelector('#iineEntry')){ // 管理トップ
            blocker_g('#iineEntry img', '#iineEntry img');
            icon_alt('#iineEntry img'); }

        if(document.querySelector('#iineHistoryEntryFrame')){ // 履歴 タブ1
            blocker_g('.userImg img', '.userImg span');
            get_src();
            find_user();
            blue_user(); }

        if(document.querySelector('#iineHistoryUserFrame')){ // 履歴 タブ2
            blocker_r2();
            checker_r2();
            get_src();
            find_user();
            blue_user(); }

    } // blocker()



    function blocker_g(src_elem, disp_elem){
        let disp=[];
        let iineImg=[];
        let Img_src=[];

        disp=document.querySelectorAll(disp_elem);
        iineImg=document.querySelectorAll(src_elem);
        for(let k=0; k<iineImg.length; k++){ // ユーザーアイコンのフィルター
            Img_src[k]=iineImg[k].getAttribute('src');
            if(block_regex_img.test(Img_src[k])==true){
                if(edit_mode==0 || edit_mode==2){
                    disp[k].style.display='none'; }
                else{
                    disp[k].style.display='';
                    disp[k].style.outline='auto red';
                    if(ua==1){
                        disp[k].style.outline='2px solid red';
                        disp[k].style.outlineOffset='-2px';}}}
            else{
                disp[k].style.display='';
                disp[k].style.outline=''; }}}



    function blocker_r2(){
        let user_href=[];
        let iine_tr=[];

        iine_tr=document.querySelectorAll('#iineHistoryUserFrame tr');
        for(let k=1; k<iine_tr.length; k++){ // ユーザーアイコンのフィルター
            if(iine_tr[k].querySelector('.heading a')){
                user_href[k]=iine_tr[k].querySelector('.heading a').getAttribute('href');

                if(block_regex_id.test(user_href[k])==true){ // IDがリスト上にある場合
                    if(edit_mode==0 || edit_mode==2){
                        iine_tr[k].style.display='none'; }
                    else{
                        iine_tr[k].style.display='table-row';
                        iine_tr[k].style.boxShadow='inset 0 0 0 1px #fff,inset 0 0 0 3px red'; }

                    let user_src=iine_tr[k].querySelector('.list_img img').getAttribute('src');
                    if(user_src){
                        user_src=user_src.replace('https://stat.profile.ameba.jp/profile_images/', '');
                        user_src=user_src.replace(/\?cpc=100/g, ''); }
                    else{
                        user_src=''; } // imgが無い場合
                    for(let s=0; s<iine_block_data.length; s++){
                        if(user_href[k].indexOf(iine_block_data[s][0])!=-1){
                            iine_block_data[s][1]=user_src; }} // ID該当した場合にimgを再登録
                    write_local(); } // imgの再登録 ローカルストレージ 保存

                else{
                    iine_tr[k].style.display='table-row';
                    iine_tr[k].style.boxShadow='none';
                    let list_img=iine_tr[k].querySelector('.list_img');
                    let list_img_url=list_img.getAttribute('href');
                    if(list_img && list_img_url){
                        prevent(list_img, list_img_url); }
                    let user_link=iine_tr[k].querySelector('.heading a');
                    prevent(user_link, user_href[k]); }

                function prevent(link, url){
                    link.onclick=function(event){
                        event.preventDefault();
                        window.open(url, '_blank'); }}
            }}

    } // blocker_r2()



    function icon_alt(img){
        let icon=document.querySelectorAll(img);
        for(let k=0; k<icon.length; k++){
            let alt=icon[k].getAttribute('alt');
            if(alt){
                let add_cap=
                    '<div class="add_cap"><div class="add_in">'+ alt +'</div></div>';
                if((icon[k].nextElementSibling && icon[k].nextElementSibling.tagName=='IMG') ||
                   !icon[k].nextElementSibling ){
                    icon[k].insertAdjacentHTML('afterend', add_cap); }}}

        let style=
            '<style class="iine_icon_style">'+
            '.add_cap { position: relative; width: 0; height: 0; display: none; } '+
            '.add_in { position: absolute; top: -40px; left: -40px; font: normal 13px Meiryo; '+
            'display: flex; align-items: center; padding: 2px 6px 0; white-space: nowrap; '+
            'height: 16px; border: 1px solid #aaa; background: #fff; z-index: 1; } '+
            '.iineEntry__itemUserImage:hover + div { display: block; }'+
            '</style>';

        if(!document.querySelector('.iine_icon_style')){
            document.querySelector('#iineEntry')
                .insertAdjacentHTML('beforeend', style); }}



    //== blocker_dia ==

    let target2=document.body; // 監視 target
    let monitor2=new MutationObserver(blocker_dia);
    monitor2.observe(target2, { childList: true }); // 監視開始

    function blocker_dia(){
        reg_set();

        if(document.querySelector('#iineEntry')){ // 管理トップ
            blocker_dia_g(0, '.iineEntryModal__header',
                          '.iineEntryModal__headerTitle', '.iineEntryModal__count', 1,
                          'h2.iineEntry__heading', '.iineEntryModal__list li', '.iineEntryModal__userIcon');
            checker_g('.iineEntryModal__list li'); }

        if(document.querySelector('#iineHistoryEntryFrame')){ // 履歴 タブ1
            blocker_dia_g(1, '#iineEntryHeader',
                          '#iineEntryHeader a', '#iineEntryHeader .tx_orageA', 2,
                          '#iineHistoryEntryFrame th', '#iineEntryContents li', '.iineProfImg img');
            checker_g('#iineEntryContents li');
            get_src();
            blue_user_dia(); }

    } // blocker_dia()



    function smart(n){
        if(n==0){
            let headerT=document.querySelector('.iineEntryModal__header');
            if(headerT){
                headerT.style.paddingLeft='16px';
                let title=headerT.querySelector('#iineEntryModal__headerTitle');
                if(title){
                    let title_text=title.textContent;
                    if(title_text.slice(-8)=='」についたいいね'){
                        title_text=title_text.slice(1);
                        title_text=title_text.slice(0, -8);
                        title.textContent=title_text; }}
                if(!document.querySelector('.iineEntryModal__header svg')){
                    headerT.insertAdjacentHTML('afterbegin', svg_mark_dn); }}}

        if(n==1){
            let headerT=document.querySelector('#iineEntryHeader p');
            if(headerT){
                headerT.style.background='none';
                headerT.style.fontSize='0';
                headerT.style.padding='10px 30px 8px 28px';
                let title=headerT.querySelector('#iineEntryHeader .tx_bold');
                if(title){
                    title.style.fontSize='14px';
                    title.style.padding='0 1em 0 .5em'; }
                let count=headerT.querySelector('#iineEntryHeader .tx_orageA');
                if(count){
                    count.style.fontSize='14px';
                    count.style.fontWeight='bold'; }
                if(!document.querySelector('#iineEntryHeader svg')){
                    headerT.insertAdjacentHTML('beforebegin', svg_mark_d); }}}

    } // smart(n)



    function blocker_dia_g(smart_n, header_elem,
                            header_link_elem, header_count_elem, auto_scroll,
                            iine_th_elem, user_li_elem, uesr_src_elem){
        let user_li=[];
        let user_href=[];

        smart(smart_n);


        let svgm_d=document.querySelector('.svgm_d');
        let header=document.querySelector(header_elem);
        let header_count=document.querySelector(header_count_elem);
        let header_link=document.querySelector(header_link_elem);

        if(smart_n==0){
            if(svgm_d && header && header_link && edit_mode==0){
                svgm_d.style.fill='#2196f3';
                header.style.background='#f7f7f7';
                header_link.style.color='#08121a';
                header_count.style.color="red"; }
            else if(svgm_d && header && header_link && edit_mode==1){
                svgm_d.style.fill='red';
                header.style.background='red';
                header_link.style.color='#fff';
                header_count.style.color="#fff"; }
        } // smart_n==0 // 管理トップ


        if(smart_n==1){
            if(header_link){
                header_link.setAttribute('target', '_blank');
                header_link.onclick=function(event){
                    event.stopImmediatePropagation(); }}
            if(svgm_d && header && header_link && edit_mode==0){
                svgm_d.style.fill='#2196f3';
                header.style.background='#f7f7f7';
                header_link.style.color='#06c';
                header_link.style.pointerEvents='auto';
                header_count.style.color="red"; }
            else if(svgm_d && header && header_link && edit_mode==2){
                svgm_d.style.fill='#2196f3';
                header.style.background='#2196f3';
                header_link.style.color='#fff';
                header_link.style.pointerEvents='auto';
                header_count.style.color='#fff'; }
            else if(svgm_d && header && header_link && edit_mode==1){
                svgm_d.style.fill='red';
                header.style.background='red';
                header_link.style.color='#fff';
                header_link.style.pointerEvents='none';
                header_count.style.color="#fff"; }
        } // smart_n==1 // 履歴 タブ1


        if(auto_scroll==1){
            monitor2.disconnect();
            end_more_dia('.iineEntryModal__contents', '.iineEntryModal__moreBtn button');
            monitor2.observe(target2, {childList: true, subtree: true}); } // 監視開始

        if(auto_scroll==2){
            monitor2.disconnect();
            end_more_dia('#iineEntryContents', '#moreLinkBtm.moreBtm span');
            monitor2.observe(target2, {childList: true, subtree: true}); } // 監視開始

        if(header){
            header.onclick=function(event){
                if(edit_mode==1){
                    edit_mode=0; }
                blocker_dia();
                blocker();
                let iine_th=document.querySelectorAll(iine_th_elem);
                if(smart_n==0){
                    title_disp(iine_th[0], iine_th[0]); }
                if(smart_n==1){
                    title_disp(iine_th[0], iine_th[1]); }}}

        if(svgm_d){
            svgm_d.onclick=function(event){
                event.stopImmediatePropagation();
                if(edit_mode==0){
                    edit_mode=1; }
                else{
                    edit_mode=0; }
                blocker_dia();
                blocker();
                let iine_th=document.querySelectorAll(iine_th_elem);
                if(smart_n==0){
                    title_disp(iine_th[0], iine_th[0]); }
                if(smart_n==1){
                    title_disp(iine_th[0], iine_th[1]); }}}


        user_li=document.querySelectorAll(user_li_elem);
        if(user_li.length !=0){
            for(let k=0; k<user_li.length; k++){ // ダイアログのリストのフィルター
                if(user_li[k].querySelector('a')){
                    user_href[k]=user_li[k].querySelector('a').getAttribute('href');

                    if(block_regex_id.test(user_href[k])==true){ // IDがリスト上にある場合
                        if(edit_mode==0 || edit_mode==2){
                            user_li[k].style.display='none';
                            user_li[k].style.outline='';
                            user_li[k].style.outlineOffset=''; }
                        else{
                            user_li[k].style.display='';
                            user_li[k].style.outline='2px solid red';
                            user_li[k].style.outlineOffset='-3px'; }

                        let user_src=user_li[k].querySelector(uesr_src_elem).getAttribute('src');
                        if(user_src){
                            user_src=user_src.replace('https://stat.profile.ameba.jp/profile_images/', '');
                            user_src=user_src.replace(/\?cpc=100/g, ''); }
                        else{
                            user_src=''; } // imgが無い場合
                        for(let s=0; s<iine_block_data.length; s++){
                            if(user_href[k].indexOf(iine_block_data[s][0])!=-1){
                                iine_block_data[s][1]=user_src; }} // ID該当した場合にimgを再登録
                        write_local(); } // imgの再登録 ローカルストレージ 保存

                    else{
                        user_li[k].style.outline='';
                        prevent(user_li[k], user_href[k]); }

                    function prevent(link, url){
                        link.onclick=function(event){
                            event.preventDefault();
                            window.open(url, '_blank'); }}
                }}}

    } // blocker_dia_g()



    //== checker ==

    function checker_g(user_li_elem){
        let user_li=[];
        let user_href=[];
        let user_id=[];
        let user_src=[];

        user_li=document.querySelectorAll(user_li_elem);
        if(user_li.length !=0 && edit_mode==1){
            for(let k=0; k<user_li.length; k++){
                if(user_li[k].querySelector('a')){
                    user_href[k]=user_li[k].querySelector('a').getAttribute('href');
                    user_src[k]=user_li[k].querySelector('img').getAttribute('src');
                    user_li[k].onclick=function(event){ // リストのクリックで設定
                        event.preventDefault(); // クリックしてもリンク先に飛ばない
                        local_backup(k); }}}

            function local_backup(k){
                if(block_regex_id.test(user_href[k])!=true){ // 登録無い場合は登録
                    user_id[k]=user_href[k].replace('https://ameblo.jp/', '').replace('/', '');
                    user_src[k]=
                        user_src[k].replace('https://stat.profile.ameba.jp/profile_images/', '');
                    iine_block_data.push([user_id[k], user_src[k]]);
                    write_local(); } // ローカルストレージ 保存

                else if(block_regex_id.test(user_href[k])==true){ // 登録あれば登録削除
                    user_id[k]=user_href[k].replace('https://ameblo.jp/', '');
                    iine_block_data.splice(iine_block_id.indexOf(user_id[k]), 1);
                    write_local(); } // ローカルストレージ 保存

                blocker_dia();
                blocker(); }}

    } // checker_g()



    function checker_r2(){
        let iine_tr=[];
        let user_href=[];
        let user_id=[];
        let user_src=[];

        iine_tr=document.querySelectorAll('#iineHistoryUserFrame tr');
        for(let k=1; k<iine_tr.length; k++){
            let n=k;

            iine_tr[n].onclick=function(){
                local_backup(n); }

            if(edit_mode==1){
                investigate(n); }}


        function local_backup(n){
            let user_link=iine_tr[n].querySelector('.heading a');
            if(user_link && edit_mode==1){
                user_href[n]=user_link.getAttribute('href');
                user_src[n]=iine_tr[n].querySelector('.list_img img').getAttribute('src');
                if(block_regex_id.test(user_href[n])!=true){ // 登録がなければ登録
                    user_id[n]=user_href[n].replace('https://ameblo.jp/', '');
                    user_id[n]=user_id[n].replace(/\//g, '');
                    user_src[n]=
                        user_src[n].replace('https://stat.profile.ameba.jp/profile_images/', '');
                    user_src[n]=user_src[n].replace(/\?cpc=100/g, '');
                    iine_block_data.push([user_id[n], user_src[n]]);
                    write_local(); } // ローカルストレージ 保存

                else if(block_regex_id.test(user_href[n])==true){ // 登録があれば登録削除
                    user_id[n]=user_href[n].replace('https://ameblo.jp/', '');
                    user_id[n]=user_id[n].replace(/\//g, '');
                    iine_block_data.splice(iine_block_id.indexOf(user_id[n]), 1);
                    write_local(); } // ローカルストレージ 保存

                reg_set();
                blocker(); }}


        function investigate(n){ // 調査モード
            let user_icon_link=iine_tr[n].querySelector('.list_img');
            let user_link=iine_tr[n].querySelector('.heading a');

            user_icon_link.onclick=function(event){
                event.stopImmediatePropagation();
                event.preventDefault(); }

            user_link.onclick=function(event){
                event.stopImmediatePropagation();
                event.preventDefault(); }}

    } // checker_r2()



    //== file_backup ==

    function file_backup(){
        let css=
            '#iine { position: relative; } '+
            '#imute_dia { position: absolute; top: -47px; left: 0; height: 36px; '+
            'width: 100%; box-sizing: border-box; border: 1px solid #aaa; '+
            'background: #e2eef0; box-shadow: 0 -5px 0 15px #fff; z-index: 10; } '+
            '#button_add { margin: 0 5px 0 40px; } '+
            '#button_add_label { vertical-align: -1px; } '+
            '#button2 { margin: 4px 0 0 10px; vertical-align: 1px; width: 320px; } ';

        if(ua==0){
            css +=
                '#button1 { padding: 2px 8px 0; margin: 4px 30px; } '+
                '#button3 { padding: 2px 6px 0; margin: 4px 0 0 50px; } '; }
        if(ua==1){
            css +=
                '#button1 { padding: 0 8px; margin: 4px 30px; } '+
                '#button3 { padding: 0 6px; margin: 4px 0 0 50px; } '; }

        let insert_div=
            '<div id="imute_dia">'+
            '<input id="button1" type="submit" value="排除リストを保存する">'+
            '<input id="button_add" type="checkbox">'+
            '<span id="button_add_label">差分追加</span>'+
            '<input id="button2" type="file">'+
            '<input id="button3" type="submit" value="✖ 閉じる">'+
            '<style>'+ css +'</style>'+
            '</div>';

        if(document.querySelector('#iineEntry')){ // 管理トップ
            if(!document.querySelector('#imute_dia')){
                document.querySelector('#iineEntry')
                    .insertAdjacentHTML('beforeend', insert_div); }}

        if(document.querySelector('#iineHistoryEntryFrame')){ // 履歴 タブ1
            if(!document.querySelector('#imute_dia')){
                document.querySelector('#iineHistoryEntryFrame')
                    .insertAdjacentHTML('beforeend', insert_div); }}

        backup_engine('iine_mute.json', blocker);

    } // file_backup()



    //== find_user ==

    function find_user(){
        let k;
        let iine_span=[];
        let iineImg=[];
        let Img_src=[];

        let list_frame=document.querySelector('#iineHistoryContent');
        if(list_frame && edit_mode==2){
            let f_panel=
                '<div id="f_panel">'+
                '<input id="set_user" type="text" '+
                'placeholder="検索するアイコン画像のSRCを入力　　'+
                '下表のアイコン画像のClickで自動入力できます">'+
                '<input id="clear" type="submit" value="✖">'+
                '<input id="find_img" type="submit" value="ユーザー検索">'+
                '<style>'+
                '#f_panel { position: absolute; top: -80px; left: 0; width: 100%; display: flex; '+
                'padding: 4px 0; background: #fff; } '+
                '#set_user { width: 100%; padding: 3px 30px 1px 10px; background: #e4f7fa; '+
                'font: 16px Meiryo; border: 1px solid #666; border-radius: 3px; } '+
                '#set_user::placeholder { font-size: 15px; color: #666; } '+
                '#clear { width: 32px; margin: 1px 12px 1px -28px; padding: 2px 0 0; '+
                'border: none; background: none; font: 16px Meiryo; } '+
                '#clear:hover { text-shadow: 0 0 1px #fff; filter: invert(2); } '+
                '#find_img { width: auto; padding: 2px 8px 1px; font: bold 14px Meiryo; } '+
                '.userImg img, .iineProfImg img, .list_img img { outline-offset: -3px; } '+
                '.iineProfImg img  { height: 38px; width: 38px; object-fit: cover; } '+
                '.list_img img { height: 40px; width: 40px; object-fit: cover; } '+
                '.iineSetting { margin-bottom: 15px; }'+
                '</style></div>';

            if(!list_frame.querySelector('#f_panel')){
                list_frame.insertAdjacentHTML('beforeend', f_panel); }

            let set_user=document.querySelector('#set_user');
            let clear=document.querySelector('#clear');
            let find_img=document.querySelector('#find_img');

            set_user.value=find_img_src;

            clear.onclick=function(){
                set_user.value='';
                find_img_src='';
                blue_user(); }

            find_img.onclick=function(){
                if(set_user.value!=''){
                    let src=set_user.value;
                    src=src.replace(/https:\/\/stat\.profile\.ameba\.jp\/profile_images\//, '');
                    src=src.replace(/\?.*$/, '');
                    set_user.value=src;
                    find_img_src=src;
                    blue_user(); }}

        }} // find_user()



    function blue_user(){
        let k;
        let iineImg=[];
        let Img_src=[];

        iineImg=document.querySelectorAll('img');
        for(k=0; k<iineImg.length; k++){ // ユーザーアイコンのフィルター
            Img_src[k]=iineImg[k].getAttribute('src');
            if(find_img_src!=''){
                if(Img_src[k].indexOf(find_img_src)!=-1){
                    if(edit_mode==2){
                        iineImg[k].style.outline='3px solid #fff';
                        iineImg[k].style.boxShadow='0 0 0 4px #2196f3'; }
                    else{
                        iineImg[k].removeAttribute('style'); }}
                else{
                    iineImg[k].removeAttribute('style'); }}
            if(find_img_src==''){
                iineImg[k].removeAttribute('style'); }}}



    function blue_user_dia(){
        let k;
        let iineImg=[];
        let Img_src=[];

        if(find_img_src!=''){
            iineImg=document.querySelectorAll('.iineProfImg img');
            for(k=0; k<iineImg.length; k++){ // ダイアログのアイコンのマーク
                Img_src[k]=iineImg[k].getAttribute('src');
                if(Img_src[k].indexOf(find_img_src)!=-1){
                    if(edit_mode==2){
                        iineImg[k].style.outline='3px solid #fff';
                        iineImg[k].style.boxShadow='0 0 0 4px #2196f3'; }
                    else{
                        iineImg[k].removeAttribute('style'); }}
                else{
                    iineImg[k].removeAttribute('style'); }}}}



    function find_user_end(){
        let f_panel=document.querySelector('#f_panel');
        if(f_panel){
            f_panel.remove(); }}



    function get_src(){
        set_imgmenu();

        let icon_img=[];
        icon_img=document.querySelectorAll('img');
        for(let k=0; k<icon_img.length; k++){
            icon_img[k].addEventListener('click', function(event){
                img_mark(k); }); }

        function img_mark(k){
            if(edit_mode==2){
                event.preventDefault();
                event.stopImmediatePropagation();

                let menu=document.querySelector('#img_menu');
                let icon_src=icon_img[k].getAttribute('src');

                if(icon_src.indexOf('profile_images')!=-1){
                    if(navigator.clipboard){
                        navigator.clipboard.writeText(icon_src); }

                    let set_user=document.querySelector('#set_user');
                    if(set_user){
                        set_user.value=icon_src; }

                    menu.textContent='⭕';
                    menu.style.display="block"; }
                else{
                    menu.textContent='❌';
                    menu.style.display="block"; }

                menu.style.left=(event.pageX-12) +"px";
                menu.style.top=(event.pageY-30) +"px";
                menu.style.filter='hue-rotate(-150deg) brightness(2)';
                setTimeout(()=>{
                    menu.style.display="none";
                }, 2000); }}


        document.body.addEventListener('click', function(event){
            let menu=document.querySelector('#img_menu');
            if(menu){
                menu.style.display="none"; }}); // 画像以外の場所のクリックでマークを消す

    } // get_src()

} // document.domain.includes('blog.ameba')




// ==========  Bad Iine Mute BlogPage =============================


if(document.domain.includes('ameblo')){
    let zoom_f; // bodyのzoom値

    let target4=document.head; // 監視 target
    let monitor4=new MutationObserver(mode_select);
    monitor4.observe(target4, {childList: true}); // 監視開始

    mode_select();

    function mode_select(){
        let iine_title=document.querySelector('#iineEntryHeader');
        if(iine_title){

            monitor4.disconnect();
            smart_bp();
            title_disp_bp();
            end_more_dia('#iineEntryContents', '#moreLinkBottom span');
            monitor4.observe(target4, {childList: true});

            iine_title.onclick=function(event){
                event.preventDefault();
                if(event.altKey==true){ // 「Altキー ＋ 左クリック」
                    if(edit_mode==0){
                        edit_mode=1;
                        file_backup_bp();
                    } // ファイル保存 ブログページ
                    else{
                        edit_mode=0;
                        file_backup_end(); }}
                else{
                    if(edit_mode==0){
                        edit_mode=1; }
                    else{
                        edit_mode=0;
                        file_backup_end(); }}

                title_disp_bp();
                blocker_dia_bp(); }}

        if(!iine_title){ // いいねダイアログが非表示になった時
            edit_mode=0; }

    } // mode_select()



    function title_disp_bp(){
        let svgm_t=document.querySelector('.svgm_t');
        let iine_title=document.querySelector('#iineEntryHeader');
        let iine_span=document.querySelectorAll('#iineEntryHeader span');
        if(edit_mode==0){
            svgm_t.style.fill='#2196f3';
            iine_title.style.boxShadow='none';
            iine_span[0].style.color='#333';
            iine_span[1].style.color='#999';
            iine_span[2].style.color='#fe9019'; }
        else{
            svgm_t.style.fill='red';
            iine_title.style.boxShadow='inset 0 0 0 40px red';
            iine_span[0].style.color='#fff';
            iine_span[1].style.color='#fff';
            iine_span[2].style.color='#fff'; }}



    function smart_bp(){
        let headerT=document.querySelector('.iineListHeaderText');
        let svgT=document.querySelector('.iineListHeaderText svg');
        if(headerT && svgT){
            let bT=document.createElement('b');
            bT.setAttribute('id', 'sm');
            if(!headerT.querySelector('#sm')){
                headerT.insertBefore(bT, svgT); }
            svgT.remove();

            headerT.style.fontSize='0';
            let nice=headerT.querySelector('#sm');
            if(nice){
                nice.innerHTML=svg_mark_t;
                nice.style.paddingRight='6px'; }

            let title=headerT.querySelector('.iineListHeaderText .tx_bold');
            if(title){
                title.style.fontSize='14px'; }
            let count=headerT.querySelector('.iineListHeaderText .tx_grayA');
            if(count){
                count.style.fontSize='14px'; }}}



    let target5=document.body; // 監視 target
    let monitor5=new MutationObserver(blocker_dia_bp);
    monitor5.observe(target5, {childList: true, subtree: true}); // 監視開始

    function blocker_dia_bp(){
        let user_li=[];
        let user_href=[];

        user_li=document.querySelectorAll('#iineEntryContents li');
        if(user_li.length !=0){
            for(let k=0; k<user_li.length; k++){ // ダイアログのリストのフィルター
                if(user_li[k].querySelector('a')){
                    user_href[k]=user_li[k].querySelector('a').getAttribute('href');

                    if(block_regex_id.test(user_href[k])==true){ // IDが該当する場合
                        if(edit_mode==0){
                            user_li[k].style.display='none';
                            user_li[k].style.outline='';
                            user_li[k].style.outlineOffset=''; }
                        else{
                            user_li[k].style.display='';
                            user_li[k].style.outline='2px solid red';
                            user_li[k].style.outlineOffset='-3px'; }

                        let user_src=user_li[k].querySelector('.iineProfImg img').getAttribute('src');
                        if(user_src){
                            user_src=user_src.replace('https://stat.profile.ameba.jp/profile_images/', '');
                            user_src=user_src.replace(/\?cpc=100/g, ''); }
                        else{
                            user_src=''; } // imgが無い場合
                        for(let s=0; s<iine_block_data.length; s++){
                            if(user_href[k].indexOf(iine_block_data[s][0])!=-1){
                                iine_block_data[s][1]=user_src; }} // ID該当した場合にimgを再登録
                        write_local(); } // imgの再登録 ローカルストレージ 保存

                    else{
                        user_li[k].style.outline='';
                        prevent(user_li[k], user_href[k]); }

                    function prevent(link, url){
                        link.onclick=function(event){
                            event.preventDefault();
                            window.open(url, '_blank'); }}
                }}}

        get_src();
        checker_bp();

    } // blocker_dia_bp()



    function checker_bp(){
        let user_li=[];
        let user_href=[];
        let user_id=[];
        let user_src=[];

        user_li=document.querySelectorAll('#iineEntryContents li');
        if(user_li.length !=0){
            for(let k=0; k<user_li.length; k++){
                let user_link=user_li[k].querySelector('a');
                if(user_link){
                    if(edit_mode==0){
                        user_link.style.pointerEvents='auto'; }
                    if(edit_mode==1){
                        user_link.style.pointerEvents='none';
                        user_href[k]=user_li[k].querySelector('a').getAttribute('href');
                        user_src[k]=user_li[k].querySelector('img').getAttribute('src');
                        user_li[k].onclick=function(event){ // リストのクリックで設定
                            local_backup(k); }}}}

            function local_backup(k){
                if(edit_mode==1){
                    if(block_regex_id.test(user_href[k])!=true){ // 登録が無ければ登録
                        user_id[k]=user_href[k].replace(/\//g, '');
                        user_src[k]=
                            user_src[k].replace('https://stat.profile.ameba.jp/profile_images/', '');
                        user_src[k]=user_src[k].replace(/\?cpc=100/g, '');
                        iine_block_data.push([user_id[k], user_src[k]]);
                        write_local(); } // ローカルストレージ 保存

                    else if(block_regex_id.test(user_href[k])==true){ // 登録あれば登録削除
                        user_id[k]=user_href[k].replace(/\//g, '');
                        iine_block_data.splice(iine_block_id.indexOf(user_id[k]), 1);
                        write_local(); } // ローカルストレージ 保存

                    reg_set();
                    blocker_dia_bp(); }}}

    } // checker_bp()



    function file_backup_bp(){
        let css=
            '#imute_dia { position: absolute; top: -60px; width: 100%; font: 13px Meiryo; '+
            'height: 40px; border-radius: 6px; background: #e2eef0; color: #000; } '+
            '#button_add { margin: 0 5px 0 20px; vertical-align: -3px; } '+
            '#button_add_label { background: #e2eef0; vertical-align: -1px; } '+
            '#button2 { margin: 0 0 0 10px; width: 260px; vertical-align: 1px; } ';

        if(ua==0){
            css +=
                '#button1 { padding: 2px 8px 0; margin: 7px 15px 0 20px; } '+
                '#button3 { position: absolute; top: -9px; right: -9px; width: 27px; '+
                'height: 27px; color: #fff; text-indent: 1px; '+
                'border: 2px solid #fff; border-radius: 50%; background: #999; } '; }
        if(ua==1){
            css +=
                '#button1 { padding: 1px 8px 0; margin: 7px 15px 0 20px; } '+
                '#button3 { position: absolute; top: -9px; right: -9px; width: 27px; '+
                'height: 27px; color: #fff; '+
                'border: 2px solid #fff; border-radius: 50%; background: #999; } '; }

        let insert_div=
            '<div id="imute_dia">'+
            '<input id="button1" type="submit" value="排除リストを保存する">'+
            '<input id="button_add" type="checkbox">'+
            '<span id="button_add_label">差分追加</span>'+
            '<input id="button2" type="file">'+
            '<input id="button3" type="submit" value="✖">'+
            '<style>'+ css +'</style>'+
            '</div>';

        let frame=document.querySelector('#iineEntryFrame');
        if(!frame.querySelector('#imute_dia')){
            frame.insertAdjacentHTML('beforeend', insert_div); }

        backup_engine('iine_mute_bp.json', blocker_dia_bp);

    } // file_backup_bp()



    function get_src(){
        set_imgmenu();

        let icon_img=[];
        icon_img=document.querySelectorAll('#iineEntryFrame img');

        for(let k=0; k<icon_img.length; k++){
            icon_img[k].addEventListener('click', function(event){
                event.preventDefault();
                event.stopImmediatePropagation();

                let menu=document.querySelector('#img_menu');
                let icon_src=icon_img[k].getAttribute('src');
                if(icon_src.indexOf('profile_images')!=-1){
                    if(navigator.clipboard){
                        navigator.clipboard.writeText(icon_src); }
                    disp_rep(0); }
                else{
                    disp_rep(1); }
            }); }


        function disp_rep(rep){
            let body=document.querySelector('body');
            zoom_f=window.getComputedStyle(body).getPropertyValue('zoom');
            if(!zoom_f){
                zoom_f=1; } // 拡大ツールがない環境の場合

            let menu=document.querySelector('#img_menu');
            if(rep==0){
                menu.textContent='⭕'; }
            else if(rep==1){
                menu.textContent='❌'; }
            menu.style.display="block";
            menu.style.left=(event.pageX-12) /zoom_f +"px";
            menu.style.top=(event.pageY-30) /zoom_f +"px";
            menu.style.filter='hue-rotate(-150deg) brightness(2)';
            setTimeout(()=>{
                menu.style.display="none";
            }, 2000); }


        document.body.addEventListener('click', function(event){
            let menu=document.querySelector('#img_menu');
            if(menu){
                menu.style.display="none"; }}); // 画像以外の場所のクリックでマークを消す

    } // get_src()

} // document.domain.includes('ameblo')




// ==========  Common Function ============================


function end_more_dia(scroll_box, button){
    let senser=0;
    let next=0;
    let interval;
    let list_body;

    let insert_style=
        '<style id="imute_style">'+
        button+'::after { content: "▢ Space : 連続スクロール / 停止"; '+
        'outline: 1px solid #ccc; margin-left: 3em; padding: 3px 12px 1px; '+
        'background: #fff; }'+
        '</style>';

    let more_sw=document.querySelector(button);
    if(more_sw && !more_sw.querySelector('#imute_style')){
        more_sw.insertAdjacentHTML('beforeend', insert_style); }


    setTimeout(()=>{
        let more=document.querySelector(button); // Moreがある場合は全て呼込む
        let item=document.querySelectorAll(scroll_box +' li');
        if(more && item.length<18){ // リストを最低18行まで自動で開く 🔴
            more.click();
        }}, 500);


    document.addEventListener('keydown', function(event){
        if(event.keyCode==32){
            event.preventDefault();
            event.stopImmediatePropagation();

            list_body=document.querySelector(scroll_box); // scroll要素
            if(list_body){
                list_body.style.maxHeight='80vh'; }

            if(next==0 && active_check()){
                next=1;
                interval=setInterval(
                    function(){
                        go();
                        stop();
                        senser+=1;
                    }, 500); }
            else{
                next=0;
                clearInterval(interval); }
            setTimeout(()=>{
                view_end(); }, 600); } // リスト末尾を表示

        function go(){
            let more=document.querySelector(button); // Moreボタン
            if(more && next==1 && active_check()){
                more.click();
                senser=0; }}

        function stop(){
            if(senser>4){
                next=0;
                senser=0;
                clearInterval(interval);
                hide_disp(); }}

        function hide_disp(){
            view_end(); }});

    function view_end(){
        let list_body=document.querySelector(scroll_box);
        if(list_body && active_check()){
            list_body.scrollBy(0, 1000); }}

    function active_check(){
        let iine_Mask=document.querySelector('#iineEntryListMask');
        if(iine_Mask){
            let mask=window.getComputedStyle(iine_Mask).getPropertyValue('display');
            if(mask=='block'){
                return true; } // いいね履歴 ブログページでON
            else{
                return false; }} // いいね履歴 ブログページでOFF
        else{
            return true; }} // 管理トップでは 常にON

} //end_more_dia()



function write_local(){
    let write_json=JSON.stringify(iine_block_data);
    localStorage.setItem('iine_id_back', write_json); } // ローカルストレージ 保存名



function file_backup_end(){
    let imute_dia=document.querySelector('#imute_dia');
    if(imute_dia){
        imute_dia.remove(); }}



function set_imgmenu(){
    let menu=
        '<div id="img_menu"></div>'+
        '<style>'+
        '#img_menu { position: fixed; z-index: 10000; font: normal 16px Meiryo; '+
        'text-shadow: #fff 1px 1px 0, #fff 1px -1px 0, #fff -1px 1px 0, #fff -1px -1px 0; '+
        'cursor: default; display: none; }'+
        '</style>';

    if(!document.querySelector('#img_menu')){
        document.body.insertAdjacentHTML('beforeend', menu); }}



function backup_engine(filename, block_action){

    let button1=document.querySelector('#button1');
    button1.onclick=function(){
        let write_json=JSON.stringify(iine_block_data);
        let blob=new Blob([write_json], {type: 'application/json'});
        let a_elem=document.createElement('a');
        a_elem.href=URL.createObjectURL(blob);
        a_elem.download=filename; // 保存ファイル名
        a_elem.click();
        URL.revokeObjectURL(a_elem.href); }

    let button_add=document.querySelector('#button_add');
    button_add.checked=true;

    let button2=document.querySelector('#button2');
    button2.addEventListener("change" , function(){
        if(!(button2.value)) return; // ファイルが選択されない場合
        let file_list=button2.files;
        if(!file_list) return; // ファイルリストが選択されない場合
        let file=file_list[0];
        if(!file) return; // ファイルが無い場合

        let file_reader=new FileReader();
        file_reader.readAsText(file);
        file_reader.onload=function(){
            if(file_reader.result.slice(0, 15)=='[["tmp1","img1"'){ // iine_mute.jsonの確認
                let data_in=JSON.parse(file_reader.result);

                if(button_add.checked==true){ // 差分追加処理
                    for(let k=0; k<data_in.length; k++){
                        if(block_regex_id.test(data_in[k][0])!=true){ // ID未出なら追加
                            iine_block_data.push([data_in[k][0], data_in[k][1]]); }
                        else if(block_regex_id.test(data_in[k][0])==true){ // ID既出の場合
                            for(let s=0; s<iine_block_data.length; s++){
                                if(iine_block_data[s][0]==data_in[k][0]){
                                    if(iine_block_data[s][1]!=data_in[k][1]){ // imgのSRCが異なる
                                        if(Number(iine_block_data[s][1].slice(0, 8))
                                           <Number(data_in[k][1].slice(0, 8))){
                                            iine_block_data[s][1]=data_in[k][1]; }}}}}}}
                else{
                    iine_block_data=data_in; } // 読込み上書き処理
                write_local(); // ローカルストレージ 保存
                reg_set();
                block_action(); }}; });

    let button3=document.querySelector('#button3');
    button3.onclick=function(){
        let imute=document.querySelector('#imute_dia');
        if(imute){
            imute.remove(); }}

} //  backup_engine()
