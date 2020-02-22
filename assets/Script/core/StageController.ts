import { GameEvent } from "./Event";
import Player from "./entities/Player";
import Enemy from "./entities/Enemy";
import PatrollerDynamic from "./entities/PatrollerDynamic";
import Charger from "./entities/Charger";

const { ccclass, property } = cc._decorator;

const STATIC_SPAWN_RATE = 10;
const VEHICLE_SPAWN_RATE = 13;
const ZOMBIE_SPAWN_RATE = 0.9;

@ccclass
export default class StageController extends cc.Component {

    @property(Player)
    player: Player = null;

    @property(cc.AnimationClip)
    walk: cc.AnimationClip[] = new Array(4);

    @property(cc.AnimationClip)
    death: cc.AnimationClip[] = new Array(4);

    @property(cc.TiledLayer)
    topLayer: cc.TiledLayer = null;

    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    @property(cc.Prefab)
    carObstacle: cc.Prefab = null;

    @property(cc.Prefab)
    compactObstacle: cc.Prefab = null;

    @property(cc.Prefab)
    vehicle: cc.Prefab = null;

    @property(cc.Prefab)
    explosion: cc.Prefab = null;

    // ============ Enemies ============
    @property(cc.Prefab)
    patrollerDyn: cc.Prefab = null;

    @property(cc.Prefab)
    charger: cc.Prefab = null;

    public cvs: cc.Node = null;

    bulletPool: cc.NodePool = new cc.NodePool();
    staticCarPool: cc.NodePool = new cc.NodePool();
    staticCompactPool: cc.NodePool = new cc.NodePool();
    vehiclePool: cc.NodePool = new cc.NodePool();
    patrollerDynPool: cc.NodePool = new cc.NodePool();
    chargerPool: cc.NodePool = new cc.NodePool();
    explosionPool: cc.NodePool = new cc.NodePool();

    private staticObjectSpawnTimer: number = 8.5;
    private vehicleSpawnTimer: number = 2;
    private zombieSpawner: number = 1.5;

    private started = false;


    onLoad() {
        this.initPhysics();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        cc.systemEvent.on(GameEvent.PLAY_EXPLOSION, this.onPlayExplosion, this);
        cc.systemEvent.on(GameEvent.EXPLOSION_REMOVE, this.onExplosionRemove, this);

        cc.systemEvent.on(GameEvent.BULLET_SPAWN, this.onBulletSpawn, this);
        cc.systemEvent.on(GameEvent.BULLET_REMOVE, this.onBulletRemove, this);
        cc.systemEvent.on(GameEvent.STATIC_CAR_REMOVE, this.onStaticCarRemove, this);
        cc.systemEvent.on(GameEvent.STATIC_COMPACT_REMOVE, this.onStaticCompactRemove, this);
        cc.systemEvent.on(GameEvent.VEHICLE_REMOVE, this.onVehicleRemove, this);
        cc.systemEvent.on(GameEvent.ZOMBIE_REMOVE, this.onZombieRemove, this);
    }

    start() {
        this.cvs = cc.find("Canvas");
        // TODO z indexes
        this.topLayer.node.zIndex = 5;
        this.player.node.zIndex = 1;
    }

    update(dt) {
        if (this.started) {

            this.zombieSpawner -= dt;
            this.staticObjectSpawnTimer -= dt;
            this.vehicleSpawnTimer -= dt;
            if (this.staticObjectSpawnTimer <= 0) {
                // Random among other objects
                if (Math.random() < 0.5) {
                    this.handleStaticCarSpawn();
                } else {
                    this.handleStaticCompactSpawn();
                }
            }
            if (this.vehicleSpawnTimer <= 0) {
                this.handleVehicleSpawn();
            }

            if (this.zombieSpawner <= 0) {
                this.handleZombieSpawn();
            }
        }
    }


    getMainCanvas() {
        return this.cvs;
    }

    isPlayerAlive() {
        return this.player.isAlive;;
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
        const pos = this.player.node.position;
        pos.x = pos.x + 24;
        pos.y = pos.y + 68;
        bulletNode.setPosition(pos);
        this.node.addChild(bulletNode);
    }

    private onBulletRemove(bulletNode: cc.Node) {
        bulletNode.removeFromParent();
        this.bulletPool.put(bulletNode);
    }

    private onTouchStart(event: any) {
        if (!this.started) {
            this.started = true;
        }
        this.player.chargeAttack();
        const touch: cc.Touch = event.touch;
        const converted = this.node.convertToNodeSpaceAR(touch.getLocation());
        this.handleTouch(converted);
    }

    private onTouchMove(event: any) {
        const touch: cc.Touch = event.touch;
        const converted = this.node.convertToNodeSpaceAR(touch.getLocation());
        this.handleTouch(converted);
    }

    private handleTouch(touchConverted: cc.Vec2) {
        this.player.handleMovement(touchConverted);
    }

    private onTouchEnd(event: any) {
        this.player.handleAttack();
    }

    private generateRandomPos() {
        let randomX = Math.random() * this.cvs.width / 2;
        // set sign value
        randomX *= this.generateRandomSign();
        return cc.v2(randomX, this.cvs.height * 0.8);
    }


    private generateRandomPosStatic() {
        let randomX = Math.random() * this.cvs.width / 2;
        // set sign value
        randomX *= this.generateRandomSign();
        return cc.v2(randomX, this.cvs.height * 0.65);
    }

    private generateRandomSign() {
        return Math.random() < 0.5 ? -1 : 1;
    }

    private handleZombieSpawn() {

        if (Math.random() < 0.67) {

            // zombie patroller, 2 types
            let zombieNode;
            if (this.patrollerDynPool.size() > 0) {
                zombieNode = this.patrollerDynPool.get();
            } else {
                zombieNode = cc.instantiate(this.patrollerDyn);
            }
            const zombie = zombieNode.getComponent('PatrollerDynamic');
            zombie.controller = this;
            zombie.init();

            zombieNode.setPosition(this.generateRandomPos());
            this.node.addChild(zombieNode);
            this.zombieSpawner = ZOMBIE_SPAWN_RATE;
        } else {
            // Charger
            let zombieNode;
            if (this.chargerPool.size() > 0) {
                zombieNode = this.chargerPool.get();
            } else {
                zombieNode = cc.instantiate(this.charger);
            }
            const zombie = zombieNode.getComponent('Charger');
            zombie.controller = this;
            zombie.init();

            zombieNode.setPosition(this.generateRandomPos());
            this.node.addChild(zombieNode);
            this.zombieSpawner = ZOMBIE_SPAWN_RATE;
        }
    }

    private onZombieRemove(zombie: Enemy) {
        if (zombie instanceof PatrollerDynamic) {
            zombie.node.removeFromParent();
            this.patrollerDynPool.put(zombie.node);
        }
        else if (zombie instanceof Charger) {
            zombie.node.removeFromParent();
            this.chargerPool.put(zombie.node);
        }
        else {
            console.error('NOT SUPPORTED ZOMBIE');
        }

    }

    private handleStaticCarSpawn() {
        let carNode;
        if (this.staticCarPool.size() > 0) {
            carNode = this.staticCarPool.get();
        } else {
            carNode = cc.instantiate(this.carObstacle);
        }
        const carObj = carNode.getComponent('CarStatic');
        carObj.controller = this;
        carObj.init();

        carNode.setPosition(this.generateRandomPosStatic());
        this.node.addChild(carNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }


    private onStaticCarRemove(staticCarNode: cc.Node) {
        staticCarNode.removeFromParent();
        this.staticCarPool.put(staticCarNode);
    }

    private onPlayExplosion(referenceNode: cc.Node) {
        const explosionNode = cc.instantiate(this.explosion);
        const explosion = explosionNode.getComponent('Explosion');
        explosion.init();
        this.node.addChild(explosionNode);
        explosionNode.setPosition(referenceNode.position);
    }

    private onExplosionRemove(explosionNode: cc.Node) {
        explosionNode.removeFromParent();
        this.explosionPool.put(explosionNode);
    }

    private handleStaticCompactSpawn() {
        let compactNode;
        if (this.staticCompactPool.size() > 0) {
            compactNode = this.staticCompactPool.get();
        } else {
            compactNode = cc.instantiate(this.compactObstacle);
        }
        const compactObj = compactNode.getComponent('CompactStatic');
        compactObj.controller = this;
        compactObj.init();

        compactNode.setPosition(this.generateRandomPosStatic());
        this.node.addChild(compactNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }

    private onStaticCompactRemove(staticCompactNode: cc.Node) {
        staticCompactNode.removeFromParent();
        this.staticCompactPool.put(staticCompactNode);
    }

    private handleVehicleSpawn() {

        let vehicleNode;
        if (this.vehiclePool.size() > 0) {
            vehicleNode = this.vehiclePool.get();
        } else {
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
