import { GameEvent } from "./Event";
import Bullet from "./objects/Bullet";
import Player from "./entities/Player";

const { ccclass, property } = cc._decorator;

const STATIC_SPAWN_RATE = 7;
const VEHICLE_SPAWN_RATE = 4;

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

    @property(cc.Prefab)
    carObstacle: cc.Prefab = null;

    @property(cc.Prefab)
    vehicle: cc.Prefab = null;

    public cvs: cc.Node = null;

    bulletPool: cc.NodePool = new cc.NodePool();
    staticCarPool: cc.NodePool = new cc.NodePool();
    vehiclePool: cc.NodePool = new cc.NodePool();

    private staticObjectSpawnTimer: number = 2;
    private vehicleSpawnTimer: number = 3;


    onLoad() {
        this.initPhysics();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        cc.systemEvent.on(GameEvent.BULLET_SPAWN, this.onBulletSpawn, this);
        cc.systemEvent.on(GameEvent.BULLET_REMOVE, this.onBulletRemove, this);
        cc.systemEvent.on(GameEvent.STATIC_CAR_REMOVE, this.onStaticCarRemove, this);
        cc.systemEvent.on(GameEvent.VEHICLE_REMOVE, this.onVehicleRemove, this);
    }

    start() {
        this.cvs = cc.find("Canvas");
        // TODO z indexes
        this.topLayer.node.zIndex = 5;
        this.player.node.zIndex = 1;
        this.zombie.zIndex = 0;
    }

    update(dt) {
        this.staticObjectSpawnTimer -= dt;
        this.vehicleSpawnTimer -= dt;
        if (this.staticObjectSpawnTimer <= 0) {
            // Random among other objects
            this.handleStaticCarSpawn();
        }
        if (this.vehicleSpawnTimer <= 0) {
            this.handleVehicleSpawn();
        }
    }


    getMainCanvas() {
        return this.cvs;
    }

    private initPhysics() {
        const manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        manager.enabledAccumulator = true;
        manager.gravity = cc.v2(0, 0);

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
        let bulletNode;

        if (this.bulletPool.size() > 0) {
            bulletNode = this.bulletPool.get();
        } else {
            bulletNode = cc.instantiate(this.bullet);
        }
        const bullet = bulletNode.getComponent('Bullet');
        bullet.controller = this;
        bullet.init();
        const pos = this.node.convertToNodeSpaceAR(this.player.node.position);
        pos.x = pos.x + 20;
        pos.y = pos.y + 55;
        bulletNode.setPosition(pos);
        this.node.addChild(bulletNode);
    }

    private onBulletRemove(bulletNode: cc.Node) {
        bulletNode.removeFromParent();
        this.bulletPool.put(bulletNode);
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

    private generateRandomPos() {
        let randomX = Math.random() * this.cvs.width / 2;
        // set sign value
        randomX *= this.generateRandomSign();
        return cc.v2(randomX, this.cvs.height * 0.6);
    }

    private generateRandomSign() {
        return Math.random() <= 0.5 ? -1 : 1;
    }

    private handleStaticCarSpawn() {
        let carNode;
        if (this.staticCarPool.size() > 0) {
            carNode = this.staticCarPool.get();
        } else {
            carNode = cc.instantiate(this.carObstacle);
        }
        const carObj = carNode.getComponent('Obstacle');
        carObj.controller = this;
        carNode.setPosition(this.generateRandomPos());
        carObj.init();
        this.node.addChild(carNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }

    private onStaticCarRemove(staticCarNode: cc.Node) {
        staticCarNode.removeFromParent();
        this.staticCarPool.put(staticCarNode);
    }

    private handleVehicleSpawn() {

        let vehicleNode;
        if (this.vehiclePool.size() > 0) {
            console.log('vehicle POOL!!!');
            vehicleNode = this.vehiclePool.get();
        } else {
            console.log('vehicle NEW!!!');
            vehicleNode = cc.instantiate(this.vehicle);
        }
        const vehicleObj = vehicleNode.getComponent('Vehicle');
        vehicleObj.controller = this;
        vehicleNode.setPosition(this.generateRandomPos());
        vehicleObj.init();
        this.node.addChild(vehicleNode);
        this.vehicleSpawnTimer = VEHICLE_SPAWN_RATE;
    }

    private onVehicleRemove(vehicleNode: cc.Node) {
        vehicleNode.removeFromParent();
        this.vehiclePool.put(vehicleNode);
    }
}
