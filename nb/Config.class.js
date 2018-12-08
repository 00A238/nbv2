/**
 * Number Buster v2: マスの数（blockSize），更新間隔（interval），
 * 表示確率（probability）のレベル設定値を保持するクラス。
 */
class Config {
	/**
	 * コンストラクタ
	 */
	constructor(){
		this._blockSize = 0;
		this._interval = 0;
		this._probability = 0;
	}
	/**
	 * プロパティのゲッター
	 */
	get blockSize(){
		return this._blockSize;
	}
	get interval(){
		return this._interval;
	}
	get probability(){
		return this._probability;
	}
	/**
	 * localStrageにレベル別のスコアを保存するためのキー文字列を得るゲッター
	 */
	get levelKey(){
		return "NB_"+this._blockSize+"_"+this._interval+"_"+this._probability;
	}
	/**
	 * レベルごとの標準プレイ時間を返す。
	 */
	standard(){
		var T = this._interval;
		var P = this._probability*0.01;
		var N = Math.pow(this._blockSize, 2);
		var D = 200; // 人間の視覚刺激に対する反応時間（200ms程度らしい）
		// １つのマスに数字を確率pかつTミリ秒間隔で表示する場合，叩くまでに要する時間の期待値は T/p-T+D 。
		// 全部でNマスあり，各数字の表示確率はP/i（i=1〜N）なので，それらを全て叩く時間の期待値の総和は，
		// 以下の式で得られる。
		return N*(T*(N+1)/(2.0*P)-T+D);
	}
	/**
	 * プロパティのセッター
	 */
	set blockSize(val){
		this._blockSize = val;
	}
	set interval(val){
		this._interval = val;
	}
	set probability(val){
		this._probability = val;
	}
	/**
	 * レベル設定ダイアログのフォームで与えた設定値をプロパティに反映させる。
	 */
	sync(formData){
		for(var kv of formData){
			this["_"+kv[0]] = kv[1];
		}
	}
}