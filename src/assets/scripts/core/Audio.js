var SFX = (function() {
    var SFX = function() {
        this.sounds = {};
    }

    SFX.prototype = {
        add: function(key, count, settings, volume) {
            this.sounds[key] = [];
            for (var i = 0; i < settings.length; i++) {
                var elem = settings[i];
                this.sounds[key].push({
                    tick: 0,
                    count: count,
                    pool: []
                });
                for (var j = 0; j < count; j++) {
                    var audio = new Audio();
                    audio.src = jsfxr(elem);
                    audio.volume = volume;
                    this.sounds[key][i].pool.push(audio);
                }
            }
        },
        play: function(key) {
            if (window.chrome) {
                var sound = this.sounds[key];
                var soundData = sound.length > 1 ? sound[Math.floor(Math.random() * sound.length)] : sound[0];
                soundData.pool[soundData.tick].play();
                soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
            }
        }  
    }

    return SFX;
}());
