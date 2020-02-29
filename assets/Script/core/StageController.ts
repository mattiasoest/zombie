import { GameEvent } from "./Event";
import App from "../App";
import SoundManager from "../SoundManager";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import ZombieDynamic from "../entities/ZombieDynamic";
import Zombie from "../entities/Zombie";

const { ccclass, property } = cc._decorator;

const STATIC_SPAWN_RATE = 10;
const VEHICLE_SPAWN_RATE = 13;
const ZOMBIE_SPAWN_RATE = 0.75;
const ITEM_SPAWN_RATE = 3;

@ccclass
export default class StageController extends cc.Component {

    @property(Player)
    player: Player = null;

    @property(cc.Label)
    bulletLabel: cc.Label = null;

    @property(cc.Label)
    cashLabel: cc.Label = null;

    @property(cc.AnimationClip)
    walk: cc.AnimationClip[] = new Array(4);

    @property(cc.AnimationClip)
    death: cc.AnimationClip[] = new Array(4);

    @property(cc.TiledLayer)
    topLayer: cc.TiledLayer = null;

    @property(cc.Prefab)
    ammo: cc.Prefab = null;

    @property(cc.Prefab)
    cash: cc.Prefab = null;

    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    @property(cc.Prefab)
    bigShot: cc.Prefab = null;

    @property(cc.Prefab)
    carObstacle: cc.Prefab = null;

    @property(cc.Prefab)
    compactObstacle: cc.Prefab = null;

    @property(cc.Prefab)
    tank: cc.Prefab = null;

    @property(cc.Prefab)
    vehicle: cc.Prefab = null;

    @property(cc.Prefab)
    explosion: cc.Prefab = null;

    // ============ Enemies ============
    @property(cc.Prefab)
    patrollerDyn: cc.Prefab = null;

    @property(cc.Prefab)
    zombie: cc.Prefab = null;

    public cvs: cc.Node = null;

    bulletPool: cc.NodePool = new cc.NodePool();
    staticCarPool: cc.NodePool = new cc.NodePool();
    staticCompactPool: cc.NodePool = new cc.NodePool();
    vehiclePool: cc.NodePool = new cc.NodePool();
    patrollerDynPool: cc.NodePool = new cc.NodePool();
    standardZombiePool: cc.NodePool = new cc.NodePool();
    explosionPool: cc.NodePool = new cc.NodePool();
    tankPool: cc.NodePool = new cc.NodePool();
    bigShotPool: cc.NodePool = new cc.NodePool();
    ammoPool: cc.NodePool = new cc.NodePool();
    cashPool: cc.NodePool = new cc.NodePool();

    private staticObjectSpawnTimer: number = 8.5;
    private vehicleSpawnTimer: number = 6;
    private zombieSpawner: number = 1.5;

    private itemSpawner: number = 3;

    private started = false;

    // TODO Level and total amount
    private cashAmount: number = 0;

    onLoad() {
        for (let i = 0; i < 6; i++) {
            const zombieFab = cc.instantiate(this.zombie);
            const zombieDynFab = cc.instantiate(this.patrollerDyn);
            this.standardZombiePool.put(zombieFab);
            this.patrollerDynPool.put(zombieDynFab);
            this.cashPool.put(cc.instantiate(this.cash));
            if (i < 2) {
                this.ammoPool.put(cc.instantiate(this.ammo));
                this.explosionPool.put(cc.instantiate(this.explosion));
                this.bigShotPool.put(cc.instantiate(this.bigShot));
                if (i < 1) {
                    this.staticCompactPool.put(cc.instantiate(this.compactObstacle));
                    this.staticCarPool.put(cc.instantiate(this.carObstacle));
                    this.vehiclePool.put(cc.instantiate(this.vehicle));
                }
            } else if (i < 4) {
                this.bulletPool.put(cc.instantiate(this.bullet));
            }
        }

        App.initApp();


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
        cc.systemEvent.on(GameEvent.TANK_REMOVE, this.onTankRemove, this);
        cc.systemEvent.on(GameEvent.BIG_SHOT_SPAWN, this.onBigShotSpawn, this);
        cc.systemEvent.on(GameEvent.BIG_SHOT_REMOVE, this.onBigShotRemove, this);

        cc.systemEvent.on(GameEvent.AMMO_SPAWN, this.handleAmmoSpawn, this);
        cc.systemEvent.on(GameEvent.AMMO_REMOVE, this.onAmmoRemove, this);

        cc.systemEvent.on(GameEvent.CASH_SPAWN, this.handleCashSpawn, this);
        cc.systemEvent.on(GameEvent.CASH_REMOVE, this.onCashRemove, this);

    }

    start() {
        this.cvs = cc.find("Canvas");
        this.player.node.zIndex = 10;
        this.bulletLabel.node.zIndex = 99;
        this.cashLabel.node.zIndex = 99;
        this.updateAmmoLabel();
    }

    update(dt) {
        if (this.started) {
            this.itemSpawner -= dt;
            this.zombieSpawner -= dt;
            this.staticObjectSpawnTimer -= dt;
            this.vehicleSpawnTimer -= dt;
            if (this.staticObjectSpawnTimer <= 0) {
                // Random among other objects
                if (Math.random() < 0.12) {
                    this.handleTankSpawn();
                }
                else {
                    Math.random() < 0.5 ? this.handleStaticCarSpawn() : this.handleStaticCompactSpawn();
                }
            }
            if (this.vehicleSpawnTimer <= 0) {
                this.handleVehicleSpawn();
            }

            if (this.zombieSpawner <= 0) {
                this.handleZombieSpawn();
            }

            if (this.itemSpawner <= 0) {
                // TODO MORE ITEMS
                this.handleAmmoSpawn();
            }
        }
    }


    getMainCanvas() {
        return this.cvs;
    }

    isPlayerAlive() {
        return this.player.isAlive;;
    }

    updateAmmoLabel() {
        this.bulletLabel.string = `Bullets: ${this.player.bulletAmount}`;
    }

    updateCashLabel() {
        this.cashLabel.string = `$${this.cashAmount}`;
    }

    handleCashPickup() {
        // TODO amounts
        this.cashAmount += 2;
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

    private handleAmmoSpawn() {
        let ammoNode;

        if (this.ammoPool.size() > 0) {
            ammoNode = this.ammoPool.get();
        } else {
            ammoNode = cc.instantiate(this.ammo);
        }
        const ammo = ammoNode.getComponent('Ammo');
        ammo.controller = this;
        ammo.init();
        ammoNode.setPosition(this.generateRandomPos(0.62));
        this.node.addChild(ammoNode);
        this.itemSpawner = ITEM_SPAWN_RATE;
    }

    private onAmmoRemove(ammoNode: cc.Node, pickedUp = true) {
        if (pickedUp) {
            SoundManager.play('ammo_pickup', false, 0.1);
            this.player.handleAmmoPickup();
            this.updateAmmoLabel();
        }
        ammoNode.removeFromParent();
        this.ammoPool.put(ammoNode);
    }

    private onBulletSpawn() {
        this.updateAmmoLabel();
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

    private onBulletRemove(bulletNode: cc.Node, playSound = true) {
        if (playSound) {
            SoundManager.play('bullet_hit', false, 0.3);
        }
        bulletNode.removeFromParent();
        this.bulletPool.put(bulletNode);
    }

    private handleCashSpawn(refPosition: cc.Vec2) {
        let cashNode;

        if (this.cashPool.size() > 0) {
            cashNode = this.cashPool.get();
        } else {
            cashNode = cc.instantiate(this.cash);
        }
        const cash = cashNode.getComponent('Cash');
        cash.controller = this;
        cash.init();
        cashNode.setPosition(refPosition);
        this.node.addChild(cashNode);
    }

    private onCashRemove(cashNode: cc.Node, pickedUp = true) {
        if (pickedUp) {
            SoundManager.play('cash_pickup', false, 0.3);
            this.handleCashPickup();
            this.updateCashLabel();
        }
        cashNode.removeFromParent();
        this.cashPool.put(cashNode);
    }

    private onBigShotSpawn(positionNode: cc.Node, velocityVector: cc.Vec2, cannonAngle: number) {
        // SoundManager.play('fire1', false);
        let shotNode;

        if (this.bigShotPool.size() > 0) {
            shotNode = this.bigShotPool.get();
        } else {
            shotNode = cc.instantiate(this.bigShot);
        }
        const shot = shotNode.getComponent('BigShot');
        shot.controller = this;

        shot.init(velocityVector, cannonAngle);
        positionNode.addChild(shotNode);
    }

    private onBigShotRemove(shotNode: cc.Node, playSound = true) {
        if (playSound) {
            SoundManager.play('bullet_hit', false, 0.3);
        }
        shotNode.removeFromParent();
        this.bigShotPool.put(shotNode);
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

    private generateRandomPos(yMultiplier = 0.52) {
        let randomX = Math.random() * this.cvs.width / 2;
        // set sign value
        randomX *= this.generateRandomSign();
        return cc.v2(randomX, this.cvs.height * yMultiplier);
    }

    private generateRandomSign() {
        return Math.random() < 0.5 ? -1 : 1;
    }

    private handleZombieSpawn() {

        if (Math.random() < 0.4) {
            let zombieNode;
            if (this.patrollerDynPool.size() > 0) {
                zombieNode = this.patrollerDynPool.get();
            } else {
                zombieNode = cc.instantiate(this.patrollerDyn);
            }
            const zombie = zombieNode.getComponent('ZombieDynamic');
            zombie.controller = this;
            zombie.init();

            zombieNode.setPosition(this.generateRandomPos());
            this.node.addChild(zombieNode);
            this.zombieSpawner = ZOMBIE_SPAWN_RATE;
        } else {
            let zombieNode;
            if (this.standardZombiePool.size() > 0) {
                zombieNode = this.standardZombiePool.get();
            } else {
                zombieNode = cc.instantiate(this.zombie);
            }
            const zombie = zombieNode.getComponent('Zombie');
            zombie.controller = this;
            zombie.init();

            zombieNode.setPosition(this.generateRandomPos());
            this.node.addChild(zombieNode);
            this.zombieSpawner = ZOMBIE_SPAWN_RATE;
        }
    }

    private onZombieRemove(zombie: Enemy) {
        if (zombie instanceof ZombieDynamic) {
            zombie.node.removeFromParent();
            this.patrollerDynPool.put(zombie.node);
        }
        else if (zombie instanceof Zombie) {
            zombie.node.removeFromParent();
            this.standardZombiePool.put(zombie.node);
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

        carNode.setPosition(this.generateRandomPos(0.62));
        this.node.addChild(carNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }


    private onStaticCarRemove(staticCarNode: cc.Node) {
        staticCarNode.removeFromParent();
        this.staticCarPool.put(staticCarNode);
    }

    private onPlayExplosion(referenceNode: cc.Node) {
        SoundManager.play('explosion', false);
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

        compactNode.setPosition(this.generateRandomPos(0.62));
        this.node.addChild(compactNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }

    private onStaticCompactRemove(staticCompactNode: cc.Node) {
        staticCompactNode.removeFromParent();
        this.staticCompactPool.put(staticCompactNode);
    }

    private handleTankSpawn() {
        let tankNode;
        if (this.tankPool.size() > 0) {
            tankNode = this.tankPool.get();
        } else {
            tankNode = cc.instantiate(this.tank);
        }
        const tankObj = tankNode.getComponent('Tank');
        tankObj.controller = this;
        tankObj.init();

        tankNode.setPosition(this.generateRandomPos(0.7));
        this.node.addChild(tankNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }

    private onTankRemove(tankNode: cc.Node) {
        tankNode.removeFromParent();
        this.tankPool.put(tankNode);
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
        vehicleNode.setPosition(this.generateRandomPos(0.8));
        vehicleObj.init();
        this.node.addChild(vehicleNode);
        this.vehicleSpawnTimer = VEHICLE_SPAWN_RATE;
    }

    private onVehicleRemove(vehicleNode: cc.Node) {
        vehicleNode.removeFromParent();
        this.vehiclePool.put(vehicleNode);
    }
}
