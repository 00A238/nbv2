/**
 * Number Buster v2: ゲームの進行を管理し，スコアを算出するクラス。 マスに表示する数字の生成，タップした数字の当たり判定。
 */
class Scorer {
	/**
	 * コンストラクタ
	 */
	constructor(aConfig){
		this._config = aConfig;	// レベル設定オブジェクト
		this._alives  = 0;	// 生きているマスの数
		this._hitCount = 0;	// ユーザがタップした回数
		this._status = [];	// マスごとの生死を表す配列（1：生，0：死）
	}
	/**
	 * プロパティのゲッター（外部公開の必要があるものだけ）
	 */
	get config(){
		return this._config;
	}
	get alives(){
		return this._alives;
	}
	/**
	 * ゲームの開始。各種パラメータの初期化
	 */
	init(){
		this._alives = Math.pow(this._config.blockSize, 2);
		this._hitCount = 0;
		// マスの数（=_alives）だけ順にstatus配列に1を並べる
		this._status = Array(this._alives);
		this._status.fill(1);
	}
	/**
	 * index番目のマスに表示する数字（1〜alivesの乱数）を返す。Rendererでのupdate()のたびに 繰り返し呼ばれる。
	 * 死んだマスについては0を，非表示のマスについては負数を返す。
	 */
	getNumber(index){
		// 表示確率の設定からこのマスの表示／非表示を決める。
		var visible = (100 * Math.random() <= this._config.probability ? 1 : -1);
		return visible * this._status[index] * Math.floor(Math.random() * this._alives + 1);
	}
	/**
	 * index番目のマスをタップした時の数字（number）を得て，当たり判定を行い，その結果を返す。
	 * タップした数字が，盤面上で生きているマスの数字の最大値（= alives）と等しければ当たり。
	 * 副作用として，当たっていたらindex番目のマスを死んだ状態（0）にし，生きているマスの数を１つ減らす。
	 */
	hit(number, index){
		this._hitCount++;
		var flag = (number == this._alives);
		if(flag){ // 当たり！
			this._alives--;
			this._status[index] = 0;
		}
		return flag;
	}
	/**
	 * プレイ１回分の評価情報をオブジェクトにして返す。
	 * score : スコア（標準クリア時間 / (プレイ時間 * 打率) * 100）。正確に速くクリアできたらスコアは高くなる。
	 * prevScore : 同じレベル設定でプレイした時の過去の最高スコア。
	 * duration  : プレイ時間（MM:ss:mm 形式, 60分を超えたら「測定範囲外」）
	 * hitRate   : 打率（タップ数/マス数，お手つきが多いほど数値が大きい）
	 */
	evaluate(){
		performance.measure("nbScore", "nbStart", "nbFinish");
		var durMS = performance.getEntriesByName("nbScore")[0].duration;
		performance.clearMarks();
		performance.clearMeasures();
		var duration = 600000 < durMS ? "測定範囲外" :
			( ("00"+Math.floor(durMS / 60000)).substr(-2) + ":"
					+ ("00"+Math.floor((durMS % 60000) / 1000)).substr(-2) + "."
					+ ("00"+Math.floor(((durMS % 60000) % 1000) / 100) * 10).substr(-2)
					).toString(); // MM:ss:mm 形式で
		var hitRate = this._hitCount / Math.pow(this._config.blockSize, 2);
		var score = Math.round(1000.0 * this._config.standard() / (durMS * hitRate)) / 10;
		var prevScore = this.load();
		return {
			score : score,
			prevScore : prevScore,
			duration : duration,
			hitRate : hitRate
		};
	}
	/**
	 * 現在のレベル設定の過去のスコアをlocalStrageから読み出して返す。過去のスコアがなければnullを返す。
	 */
	load(){
		var value = localStorage.getItem(this._config.levelKey);
		return value === null ? value : (1 * value);
	}
	/**
	 * 現在のレベル設定に対するスコアをlocalStrageに保存する。
	 */
	save(score){
		localStorage.setItem(this._config.levelKey, score.toString());
	}
}