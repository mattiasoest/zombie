import Player from "./objects/entities/Player";
import { GameEvent } from "./Event";
import Bullet from "./objects/Bullet";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StageController extends cc.Component {

    @property(Player)
    player: Player = null;

    @property(cc.TiledLayer)
    topLayer: cc.TiledLayer = null;

    @property(cc.Node)
    zombie: cc.Node = null;

    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    public cvs: cc.Node = null;


    onLoad() {
        this.initPhysics();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        cc.systemEvent.on(GameEvent.BULLET_SPAWN, this.onBulletSpawn, this);
        cc.systemEvent.on(GameEvent.BULLET_REMOVE, this.onBulletRemove, this);
    }

    start() {
        this.cvs = cc.find("Canvas");
        console.log(this.topLayer.node.zIndex);
        this.topLayer.node.zIndex = 5;
        console.log(this.topLayer.node.zIndex);
        this.player.node.zIndex = 1;
        this.zombie.zIndex = 0;
    }

    update(dt) {
    }


    getMainCanvas() {
        return this.cvs;
    }
    private initPhysics() {
        const manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        manager.enabledAccumulator = true;

        cc.PhysicsManager.FIXED_TIME_STEP = 1 / 60;
        // The number of iterations per update of the Physics System processing speed is 10 by default
        cc.PhysicsManager.VELOCITY_ITERATIONS = 8;

        // The number of iterations per update of the Physics processing location is 10 by default
        cc.PhysicsManager.POSITION_ITERATIONS = 8;

        // if (this.showPhysicsDebugInfo) {
        //   cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_pairBit |
        //     cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        // }
    }

    private onBulletSpawn() {
        console.log('spawn bullet')
        const bulletNode = cc.instantiate(this.bullet);
        const bullet = bulletNode.getComponent('Bullet');
        bullet.controller = this;
        bullet.init();
        const pos = this.node.convertToNodeSpaceAR(this.player.node.position);
        pos.x = pos.x + 25;
        pos.y = pos.y + 50;
        bulletNode.setPosition(pos);
        this.node.addChild(bulletNode);
    }

    private onBulletRemove(bullet: Bullet) {
        console.log('bullet destroyed');
        bullet.node.removeFromParent();
        bullet.node.destroy();
    }

    private onTouchStart(event: any) {
        this.player.chargeAttack();
        const touch: cc.Touch = event.touch;
        this.handleTouch(touch);
    }

    private onTouchMove(event: any) {
        const touch: cc.Touch = event.touch;
        this.handleTouch(touch);
    }

    private handleTouch(touch: cc.Touch) {
        this.player.handleMovement(touch.getLocation());
    }

    private onTouchEnd(event: any) {
        this.player.handleAttack();
    }
}
