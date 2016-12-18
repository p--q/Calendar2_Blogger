// Calendar2_Bloggerモジュール
var Calendar2_Blogger = Calendar2_Blogger || function() {
    var cl = {
        callback: {  // コールバック関数。
            getArticles: function(json) {  // 指定した月のフィードを受け取る。
                Array.prototype.push.apply(vars.posts, json.feed.entry);// 投稿のフィードデータを配列に追加。
                if (json.feed.openSearch$totalResults.$t < vars.max) {  // 取得投稿数がvars.maxより小さい時はすべて取得できたと考える。
                    var re = /\d\d(?=T\d\d:\d\d:\d\d\.\d\d\d.\d\d:\d\d)/i;  //  フィードの日時データから日を取得するための正規表現パターン。
                    var dic = {};  // キーを日、値を投稿のURLと投稿タイトルの配列、とする辞書。
                    var d;  // 投稿がある日。
                    vars.posts.forEach(function(e){  // 投稿のフィードデータについて
                        d = Number(re.exec(e[vars.order].$t));  // 投稿の日を取得。
                        dic[d] = dic[d] || [];  // 辞書の値の配列を初期化する。
                        dic[d].push([e.link[4].href, e.link[4].title]);  // 辞書の値の配列に[投稿のURL, 投稿タイトル]の配列を入れて2次元配列にする。
                        }
                    );
                    createCalendar(dic);  // フィードデータからカレンダーを作成する。
                } else {  // 未取得のフィードを再取得する。最新の投稿が先頭に来る。
                    var m = /(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)\.\d\d\d(.\d\d:\d\d)/i.exec(json.feed.entry[json.feed.entry.length-1][vars.order].$t);  // フィードの最終投稿（最古）データの日時を取得。
                    var dt = new Date;  // 日付オブジェクトを生成。
                    dt.setTime(new Date(m[1] + m[2]).getTime() - 1 * 1000);  // 最古の投稿の日時より1秒早めるた日時を取得。ミリ秒に変換して計算。
                    if (vars.m==dt.getMonth()+1) {  // 1秒早めても同じ月ならば
                        var max = vars.y + "-" + fm(vars.m) + "-" + fm(dt.getDate()) + "T" + fm(dt.getHours()) + ":" + fm(dt.getMinutes()) + ":" + fm(dt.getSeconds()) + "%2B09:00";  // フィード取得のための最新日時を作成。
                        createURL(max);  // フィード取得のURLを作成。                       
                    }
                }  
            }
        },
        all: function(elemID) {  // ここから開始する。
            vars.elem = document.getElementById(elemID);  // idから追加する対象の要素を取得。
            if (vars.elem) {  // 追加対象の要素が存在するとき
                var dt = new Date(2013,8,1);  // 日付オブジェジェクト。例の日付データ:2013年9月1日。
                createVars(dt);  // 日付オブジェクトからカレンダーのデータを作成。
                var max = vars.y + "-" + fm(vars.m) + "-" + fm(vars.em) + "T23:59:59%2B09:00";  // 表示カレンダーの最終日23時59分59秒までのフィードを得るための日時を作成。
                createURL(max);  // フィードを取得するためのURLを作成。
            } 
        }        
    };  // end of cl
    var vars = {  // モジュール内の"グローバル"変数。
        y: null,  // 表示カレンダーの年。
        m: null,  // 表示カレンダーの月。
        em: null,  //表示カレンダーの末日。
        max: 150,  // Bloggerのフィードで取得できる最大投稿数を設定。
        posts: [],  // 投稿のフィードデータを収納する配列。
        order: "published",  // publishedかupdatedが入る。
        elem: null  // 置換するdiv要素。
    };
    function createVars(dt) {  // 日付オブジェクトからカレンダーのデータを作成。
        vars.y = dt.getFullYear();  // 表示カレンダーの年を取得。
        vars.m = dt.getMonth() + 1;  // 表示カレンダーの月を取得。
        vars.em = new Date(vars.y, vars.m-1, 0).getDate();  // 表示カレンダーの末日を取得。
    }
    function createCalendar(dic) {  // カレンダーのHTML要素を作成。 引数はキーを日、値を投稿のURLと投稿タイトルの配列、とする辞書。
        var flxCNode = nd.flxC();  // flexコンテナを得る。
        var day =  new Date(vars.y, vars.m-1, 1).getDay();  // 1日の曜日を取得。日曜日は0、土曜日は6になる。
        for(var i = 0; i < day; i++) { // 1日までの空白となるflexアイテムを開始曜日分まで取得。
            flxCNode.appendChild(nd.flxI("nontooltip"));  // クラス名nontooltipのflexアイテムをflexコンテナに追加。
        }
        var flxINode;  // 日のflexアイテム。
        for(var i = 1; i < vars.em+1; i++) {  // 1日から末日まで。
            if (i in dic) {  // 辞書のキーに日があるとき
                flxINode = nd.dateNodeWithTooltip(i); // 投稿のある日のflexアイテム。
                flxINode.appendChild(nd.tooltipWithLink(dic[i]));  // ツールチップとなるspan要素をflexアイテムの子ノードに追加。 
            } else {  // 辞書のキーに日がないとき
                flxINode = nd.flxI("nontooltip"); // 投稿のない日となるflexアイテム。  
                flxINode.textContent = i;  // 日をtextノードに取得。
            } 
            flxCNode.appendChild(flxINode);  // flexコンテナに追加。
        }
        var s = (day+vars.em) % 7;  // 7で割ったあまりを取得。
        if (s > 0) {  // 7で割り切れない時。
            for(var i = 0; i < 7-s; i++) { // 末日以降の空白を取得。
                flxCNode.appendChild(nd.flxI("nontooltip"));  //  クラス名nontooltipのflexアイテムをflexコンテナに追加。
            }        
        } 
        flxCNode.addEventListener( 'touchstart', eh.touchStart, false );  // タップしたときのイベントハンドラ。mouseoverより先に実行必要。
        flxCNode.addEventListener( 'mouseover', eh.onMouse, false );  // カレンダーのdiv要素でイベントバブリングを受け取る。マウスが要素に乗ったとき。
        flxCNode.addEventListener( 'mouseout', eh.offMouse, false );  // カレンダーのdiv要素でイベントバブリングを受け取る。要素に乗ったマウスが要素から下りたとき。
        vars.elem.textContent = null;  // 追加する対象の要素の子ノードを消去する。
        vars.elem.appendChild(flxCNode);  // 追加する対象の要素の子ノードにカレンダーのノードを追加する。
    }
    var nd = {  // HTML要素のノードを作成するオブジェクト。
        flxC: function() {  // flexコンテナを返す。
            var node = createElem("div");  // カレンダーのdiv要素を生成。
            node.style.display = "flex";  // flexコンテナにする。
            node.style.flexWrap = "wrap";  // flexコンテナの要素を折り返す。 
            return node;
        },
        flxI: function(classname) {  // flexアイテムを返す。
            var node = createElem("div");  // flexアイテムになるdiv要素を生成。
            node.style.flexBasis = "14%";  // flexアイテムの最低幅を1/7弱にする。
            node.style.flexGrow = "1";  // flexコンテナの余剰pxを均等に分配する。
            node.style.textAlign = "center";  // flexアイテムの内容を中央寄せにする。
            node.className = classname;
            return node.cloneNode(true);
        },
        dateNodeWithTooltip: function(date) {  // ツールチップのある日のflexアイテムを返す。
            var node = nd.flxI("tooltip"); // 投稿のある日となるflexアイテムを複製。  
            node.style.position = "relative";  // 投稿のある日となるflexアイテムのstyleを設定。 
            node.style.display = "inline-block";
            node.style.borderBottom = "1px dotted black";
            node.textContent = date;  // 日をtextノードに取得。textContentで代入すると子ノードは消えてしまうので注意。
            return node;
        },
        _tooltipNode: function() {  // ツールチップのノードを返す。
            var node = createElem("span");  // ツールチップとなるspan要素を生成。
            node.style.visibility = "hidden";  // ツールチップのstyleを設定。
            node.style.width = "120px";
            node.style.bottom = "100%";
            node.style.left = "50%";
            node.style.marginLeft = "-60px";
            node.style.backgroundColor = "black";
            node.style.color = "#fff";
            node.style.textAlign = "center";
            node.style.padding = "5px 0";
            node.style.borderRadius = "6px";
            node.style.position = "absolute";
            node.style.zIndex = "1";
            return node.cloneNode(true);
        },
        _aNode: function(arr) {  // ツールチップ内のリンクのノードを返す。
            var node = createElem("a");  // 投稿へのリンクとなるa要素を生成。
            node.href = arr[0];  // aタグのhrefに投稿のURLを設定。
            node.textContent = arr[1];  // aタグのtextノードに投稿のタイトルを設定。   
            return node;
        },
       tooltipWithLink: function(arr) {  // ツールチップ内のリンクを入れてノードを返す。
            var node = nd._tooltipNode();  // ツールチップとなるノード。 
            arr.forEach(function(e){  // 辞書の値の配列の各要素に対して
                node.appendChild(nd._aNode(e));  // ツールチップ内のリンクのノードをspan要素の子ノードに追加。
            });
            return node;
        }
    };
    var eh = {  // イベントハンドラオブジェクト。
        _tt: null, // ツールチップを表示させているノード。
        _timer: null,  // timeoutID
        _delay: 30,  // タイムアウトするミリ秒。
        _delay_touch: 5*1000, // タップしたときに表示するツールチップを表示するミリ秒。
        onMouse: function(e) {  // マウスが要素に乗ったときのイベントを受け取る関数。
            var target = e.target;  // イベントを発生したオブジェクト。
            eh._offTimer();  // ツールチップを消すタイマーをリセットする。タイマーでツールチップ表示を消すのはカレンダー外の要素に出た時のみ。
            if (target.className=="tooltip") {  // ツールチップを持っている日のとき
                eh._offTooltip();  // 現在のツールチップ表示を消す。
                eh._tt = target;  // ツールチップ表示ノードを再取得。
                eh._tt.lastChild.style.visibility = "visible";  // ツールチップを表示させる。   
            } else if (target.className=="nontooltip") {  // ツールチップを持っていない日のとき
                eh._offTooltip();  // 現在のツールチップ表示を消す。
            }
        },         
        touchStart: function(e) {  // 要素をタップしたときのイベントを受け取る関数。
            var target = e.target;  // イベントを発生したオブジェクト。 
            if (target.className=="tooltip") {  // ツールチップを持っているノードのとき
                eh._offTooltip();  // ツールチップ表示を消す
                eh._tt = target;  // ツールチップ表示ノードを再取得。
                eh._tt.lastChild.style.visibility = "visible";  // ツールチップを表示させる。  
                window.setTimeout(eh._offTooltip, eh._delay_touch);  // 5秒後に表示を消す。
            }
        },        
        offMouse: function(e) {  // マウスが要素から出たときのイベントを受け取る関数。
            var target = e.target;  // イベントを発生したオブジェクト。
            if (target.className=="tooltip" || target.tagName=="SPAN") {  // ツールチップを持っているノードからツールチップに入らずに出るとき、またはツールチップから出るとき。ただしその中のaタグに入った時も発火する。
                eh._timer = window.setTimeout(eh._offTooltip, eh._delay);  // ツールチップ表示を消すのをeh._delayミリ秒遅延させ、そのtimeoutIDを取得する。          
            } 
        },        
        _offTooltip: function(){  // ツールチップ表示を消す関数。
            if (eh._tt) {  // ツールチップを表示している時
                eh._tt.lastChild.style.visibility = "hidden"; // ツールチップ表示を消す。
                eh._tt = null;  // ツールチップ表示ノードの取得を取り消す。 
            }
        },
        _offTimer: function() {  // ツールチップを消すタイマーをリセットする。
           if (eh._timer) {  // 遅延タイマーが設定されている時。
               window.clearTimeout(eh._timer);  // window.setTimeout() によって設定された遅延を解除する。
               eh._timer = null;
           }
        }        
    };
    function writeScript(url) {  // スクリプト注入。
        var ws = createElem('script');
        ws.type = 'text/javascript';
        ws.src = url;
        document.getElementsByTagName('head')[0].appendChild(ws);
    }    
    function createElem(tag){  // tagの要素を作成して返す。
       return document.createElement(tag); 
    }       
    function createURL(max) {  // フィードを取得するためのURLを作成。
        var url = "/feeds/posts/summary?alt=json-in-script&orderby=" + vars.order + "&" + vars.order + "-min=" + vars.y + "-" + fm(vars.m) + "-01T00:00:00%2B09:00&" + vars.order + "-max=" + max;  // 1日0時0分0秒からmaxの日時までの投稿フィードを取得。データは最新の投稿から返ってくる。
        url += "&callback=Calendar2_Blogger.callback.getArticles&max-results=" + vars.max;  // コールバック関数と最大取得投稿数を設定。
        writeScript(url);  // スクリプト注入でフィードを取得。。
    }        
    function fm(m) {  // 数値を2桁の固定長にする。
        return ("0" + m).slice(-2);
    }
    return cl;  // グローバルスコープにオブジェクトを出す。
}();
Calendar2_Blogger.all("calendar_blogger");  // idがcalendar_bloggerの要素にカレンダーを表示させる。



