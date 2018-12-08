/**
 * Number Buster v2: ゲーム盤面を初期化／更新するクラス。
 * レベル設定に従うマスの並びの生成，更新間隔ごとの乱数表示，終了／継続処理。
 */
class Renderer {
	/**
	 * コンストラクタ
	 */
	constructor(aScorer, main){
		this._scorer = aScorer;	// スコア管理オブジェクト
		this._main = main;		// 盤面（main）のDOMオブジェクト
	}
	/**
	 * mainに対してメッセージやダイアログを表示させるためのイベントを通知する。
	 */
	message(eventName, detail, delay){
		delay = (typeof delay === 'undefined' ? 0 : delay);
		var main = this._main;
		setTimeout(function(){
			main.dispatchEvent(new CustomEvent(eventName, {detail : detail}));
		}, delay);
	}
	/**
	 * レベル設定で与えられたマスの数（blockSize）に従って，縦size個×横size個のマスを並べ，
	 * マスの表示を初期化する。
	 */
	init(){
		// 全てのマスの表示の初期化
		this.clear();
		// マスの幅（=グリッドの列幅）が親要素の幅（80vmin）の1/sizeになるようにする。
		var size = this._scorer.config.blockSize;
		var grid = this._main.querySelector("div[data-uk-grid]");
		grid.className.split(" ").forEach(function(c){
			if(/uk-child-width-1-.*/.test(c)){
				grid.classList.remove(c);
			}
		});
		grid.classList.add("uk-child-width-1-"+size);
		// マス（div.number）を先頭からsize*size個だけ表示し，残りを非表示にする。
		// マスの高さを親要素の幅（80vmin）の1/sizeになるようにする。
		this._main.querySelectorAll("div.number").forEach(function(d, i){
			if(i < size * size){
				d.removeAttribute("hidden");
				d.style.height = "calc(80vmin * (1 / "+size+"))";
			}else{
				d.setAttribute("hidden", "hidden");
			}
		});
	}
	/**
	 * 全てのマス表示の初期化。死んだマスを復帰させ，先頭から順に数字を書き入れる。
	 */
	clear(){
		this._main.querySelectorAll("div.number").forEach(function(d, i){
			d.classList.remove("hit", "uk-background-muted");
			d.textContent = (i+1).toString();
		});
	}
	/**
	 * ゲームの開始。盤面とスコア管理を初期化し，update()の呼び出しを更新間隔ごとに繰り返すための
	 * タイマーを回す。
	 */
	start(){
		if(typeof this._timerID === 'undefined'){ // startボタンの連打による開始の重複を避ける
			this.clear();
			this._scorer.init();
			// クリアまでの時間計測を開始する。
			performance.mark("nbStart");
			// 表示中のマスを並べた配列を盤面更新のために作っておく。
			this._divs = Array.from(this._main.querySelectorAll("div.number:not([hidden])"));
			var self = this;
			// ゲームループ開始
			this._timerID = setInterval(
				function(){ self.update(); }, this._scorer.config.interval);
			// 最初に叩く数字を示す。
			this.message("continue", "まず"+this._scorer.alives+"を叩け！")
		}
	}
	/**
	 * 盤面の更新。先頭から順に，表示する数字（1〜alives）をスコア管理から取得し，表示する。
	 */
	update(){
		var scorer = this._scorer;
		this._divs.forEach(function(d, i){
			// i番目のマスに表示する数字（正数なら表示，0ならヒット済み，負数なら非表示）
			var number = scorer.getNumber(i);
			if(number != 0){ // ヒット済みのマスは更新しない
				d.textContent = (0 < number ? number.toString() : '');
			}
		});
	}
	/**
	 * 盤面更新の停止。
	 */
	suspend(){
		if(typeof this._timerID !== 'undefined'){
			clearInterval(this._timerID);
			delete this._timerID;
		}
	}
	/**
	 * あるマス（element）がヒットした後の処理。アニメーションと終了／継続処理。
	 */
	hit(element){
		// CSSアニメーション（マスの回転）の発動。
		element.classList.add("hit", "uk-background-muted");
		// 生きているマスが0個になったら終了。
		if(this._scorer.alives == 0){
			this.finish();
		}else{
			this.next();
		}
	}
	/**
	 * ゲームの終了処理。スコアを計算し，保存する。スコア表示ダイアログを表示する。
	 */
	finish(){
		this.suspend();
		// クリア時刻の記録
		performance.mark("nbFinish");
		var result = this._scorer.evaluate();
		if(result.prevScore == null){
			result.message = "このレベル初挑戦だね！";
			result.prevScore = "なし";
			this._scorer.save(result.score);
		}else if(result.prevScore < result.score){
			result.message = "おめでとう，記録更新だね！";
			this._scorer.save(result.score);
		}else{
			result.message = "残念，記録更新ならず！";
		}
		this.message("finish", result, 1000);
	}
	/**
	 * ゲームの継続処理。次に叩くべき数字を示す。
	 */
	next(){
		this.message("continue", "次に"+this._scorer.alives+"を叩け！")
	}
}