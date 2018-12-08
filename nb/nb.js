/**
 * Number Buster v2: 各種オブジェクトの初期化とイベントハンドラの設定
 */
(function() {
	let main = document.getElementById("main");	// 盤面のDOMオブジェクト
	let aConfig = new Config();			// レベル設定オブジェクト
	let aScorer = new Scorer(aConfig);	// スコア管理オブジェクト
	let aRenderer = new Renderer(aScorer, main);	// 盤面管理オブジェクト

	// レベル設定ダイアログのラジオボタンの選択を変えたら，そのラベルの色を変える。
	document.getElementById("configDialog").addEventListener("change", function(e){
		if(e.target.matches("input[type=radio]")){
			// 選択したラジオボタンのラベルの色がprimaryになるようにする
			var label = e.target.parentNode;
			label.parentNode.querySelectorAll("label.uk-button")
			.forEach(function(l){
				l.classList.remove("uk-button-primary");
			});
			label.classList.add("uk-button-primary");
		}
	});
	// レベル設定ダイアログを閉じたら設定値をaConfigにセットし，盤面を初期化する。
	document.getElementById("configDialog").addEventListener("hidden", function(){
		aConfig.sync(new FormData(this.querySelector("form")));
		aRenderer.init();
	});
	// レベル設定ダイアログを開いたら現在のゲームを中断する。
	document.getElementById("configDialog").addEventListener("show", function(){
		aRenderer.suspend();
	});
	// スタートボタンを押したらゲームを始める。
	document.getElementById("start").addEventListener("click", function(){
		aRenderer.start();
	});
	// マスをクリックしたら，当たり判定と終了／継続処理をする。
	main.addEventListener("click", function(e){
		var element = e.target;
		if(element.matches("div.number")){
			// マスの並び順を得る
			var index = Array.from(main.querySelectorAll("div.number")).indexOf(element);
			if(aScorer.hit(element.textContent, index)){
				// 当たりと判定されたら，マスを潰して終了／継続処理をする。
				aRenderer.hit(element);
			}
		}
	});
	// マスを１つ潰したら，次に潰す数字を示す。
	main.addEventListener("continue", function(e){
		var message = e.detail;
		UIkit.notification.closeAll();
		UIkit.notification(message, { timeout : 1500 });
	});
	// マスを潰し終えたら，スコア表示ダイアログを表示する。
	main.addEventListener("finish", function(e){
		var result = e.detail;
		var scoreDialog = document.querySelector("#scoreDialog");
		scoreDialog.querySelector(".message").textContent = result.message;
		scoreDialog.querySelector(".score").textContent = result.score;
		scoreDialog.querySelector(".prevScore").textContent = result.prevScore;
		scoreDialog.querySelector(".duration").textContent = result.duration;
		scoreDialog.querySelector(".hitRate").textContent = result.hitRate;
		UIkit.modal(scoreDialog).show();
	});
	// レベル設定のデフォルト値を盤面に反映させる
	window.addEventListener("load", function(){
		aConfig.sync(new FormData(document.querySelector("#configDialog form")));
		aRenderer.init();
	});
})();