import { MODE } from "./StageController";
import Enemy from "../entities/Enemy";
import Zombie from "../entities/Zombie";
import ZombieDynamic from "../entities/ZombieDynamic";


export default class Level {

    levelMode: MODE = null;

    score = 0;
    levelCash = 0;

    totalZombiesKilled = 0;
    normalZombiesKilled = 0;
    dynamicZombiesKilled = 0;

    vehiclesDestroyed = 0;

    startLevel(mode: MODE) {
        console.log(`==== LEVEL STARTED: '${mode}' MODE ====`);
        this.levelMode = mode;
    }

    resetLevel() {
        this.levelMode = null;
        this.score = 0;
        this.levelCash = 0;

        this.totalZombiesKilled = 0;
        this.normalZombiesKilled = 0;
        this.dynamicZombiesKilled = 0;

        this.vehiclesDestroyed = 0;
    }

    handleCashPickup() {
        // TODO amounts
        this.levelCash += 2;
    }


    handleScore() {
        // TODO
        this.score++
    }

    handleZombieKilled(enemy: Enemy) {
        this.totalZombiesKilled++;
        this.handleScore();
        if (enemy instanceof ZombieDynamic) {
            this.dynamicZombiesKilled++;
        }
        else if (enemy instanceof Zombie) {
            this.normalZombiesKilled++;
        }
        else {
            console.error('NOT SUPPORTED ZOMBIE');
        }
    }
}
