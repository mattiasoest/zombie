const {ccclass, property} = cc._decorator;
import App from "../App";

@ccclass
export default class LoadController extends cc.Component {

    onLoad () {
        App.initApp();

        cc.director.preloadScene("stage", function (c, t) {
            cc.log("=== Stage loaded ===");
            cc.director.loadScene('stage');
        });
    }
    // update (dt) {}
}
