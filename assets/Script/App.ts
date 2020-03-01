import SoundManager from './SoundManager';
import Level from './core/Level';


class App {

    level: Level;

    initApp() {
        this.level = new Level();
        SoundManager.loadAllAudio(this.progressHandler, this.progressHandler);
    }

    progressHandler(currentCount: number, totalCount: number) {
        // console.log(`Total ${totalCount}`);
        console.log(`Progress ${currentCount / totalCount}`);
    }
}

const instance = new App();
export default instance;

