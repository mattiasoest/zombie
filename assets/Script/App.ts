import SoundManager from './SoundManager';


class App {

    initApp() {
        SoundManager.loadAllAudio(this.progressHandler, this.progressHandler);
    }

    progressHandler(currentCount: number, totalCount: number) {
        // console.log(`Total ${totalCount}`);
        console.log(`Progress ${currentCount / totalCount}`);
    }
}

const instance = new App();
export default instance;

