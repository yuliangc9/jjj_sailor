cc.Class({
    extends: cc.Component,

    properties: {
        hero: {
            default: null,
            type: cc.Node,
        },
        pan: {
            default: null,
            type: cc.Node,
        },
        endShow: {
            default: null,
            type: cc.Node,
        },
        scoreLabel: {
            default: null,
            type: cc.Label,
        },
        rankShow: {
            default: null,
            type: cc.Label,
        },
        retryButton: cc.Button,
        shareButton: cc.Button,
        road: {
            default: null,
            type: cc.Node,
        },
        road2: {
            default: null,
            type: cc.Node,
        },
        bestPhoto: {
            default: null,
            type: cc.Node,
        },
        // // defaults, set visually when attaching this script to the Canvas
        // text: 'Hello, World!'
    },

    panTouched: false,

    // use this for initialization
    onLoad: function () {
        this.pan.game = this;
        this.hero.game = this;

        this.endShow.active = false;
        this.endShow.zIndex = 200;

        this.retryButton.node.on('click', function() {
            cc.director.loadScene('road');
        }, this);
        this.shareButton.node.on('click', function() {
            FBInstant.shareAsync({
                intent: 'REQUEST',
                image: GlobalConfig.ShareImage,
                text: 'come to race!',
                data: {},
              }).then(function() {
                // continue with the game.
              });
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_START, this.beginTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touching, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.endTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.endTouch, this);

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.social();
    },

    social: function() {
        this.is_social = true;
        var self = this;

        FBInstant.getLeaderboardAsync('road_sailor_score_global')
        .then(function(leaderboard) {
            console.log("hahahhahahahaahaha");
            return leaderboard.getConnectedPlayerEntriesAsync(100, 0);
        })
        .then(function(entries) {
            self.road.getComponent("road").placeFriendScore(entries);

            entries.forEach(function(entry){
                console.log("hehehehhehehehhehehe", entry.getPlayer().getPhoto());
                console.log(entry.getRank());
                if (entry.getRank() == 1) {
                    self.bestPhoto.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(entry.getPlayer().getPhoto());
                }
            });
            if (entries.length == 0) {
                self.bestPhoto.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(FBInstant.player.getPhoto());
            }
        });

        self.preloadedInterstitial = null;
        self.adReady = false;

        FBInstant.getInterstitialAdAsync(
          '2227903747498555_2274431622845767', // Your Ad Placement Id
        ).then(function(interstitial) {
          // Load the Ad asynchronously
          self.preloadedInterstitial = interstitial;
          return self.preloadedInterstitial.loadAsync();
        }).then(function() {
          console.log('Interstitial preloaded');
          self.adReady = true;
        }).catch(function(err){
          console.error('Interstitial failed to preload: ' + err.message);
        });

        return;
    },

    fail: function() {
        var self = this;
        //console.log((new Date().getTime - this.startTime) * GlobalConfig.RoadSpeed / GlobalConfig.Pix2Distance, GlobalConfig.RoadSpeed, GlobalConfig.Pix2Distance);
        //this.scoreLabel.string = parseInt(((new Date().getTime() - this.startTime)/10 * GlobalConfig.RoadSpeed / GlobalConfig.Pix2Distance))+"m";
        var finalScore = this.road.getComponent("road").getDistance();
        this.currentFinalScore = finalScore;
        this.scoreLabel.string = finalScore +"m";
        setTimeout(() => {
            this.endShow.active = true;
        }, 3000);

        if (this.is_social) {
            var rankLableShow = "";

            FBInstant.getLeaderboardAsync('road_sailor_score_global')
            .then(function(leaderboard) {
                console.log("hohohohohohoho");
                return leaderboard.setScoreAsync(finalScore, '');
            })
            .then(function(entry) {
                FBInstant.getLeaderboardAsync('road_sailor_score_global')
                    .then(function(leaderboard) {
                        console.log("hihihihihihihi");
                        return leaderboard.getConnectedPlayerEntriesAsync(100, 0);
                    })
                    .then(function(entries) {
                        console.log("huhuhuhuhuhuhu", entries);
                        entries.forEach(function(entry){
                            console.log(entry.getRank()); // 2
                            console.log(entry.getScore()); // 42
                            console.log(entry.getExtraData()); // '{race: "elf", level: 3}'
    
                            scoreStr = (entry.getScore())+"m";
                            spaceLen = 10 - scoreStr.length;
                            spaceStr = "";
                            for(i=0;i<spaceLen;i++) {
                                spaceStr += " ";
                            }
                            rankLableShow += scoreStr+spaceStr+entry.getPlayer().getName()+"\n";
    
                            self.rankShow.string = rankLableShow;
                        });
                    });
            });

            setTimeout(function() {
                if (self.adReady) {
                    self.preloadedInterstitial.showAsync()
                    .then(function() {
                        // Perform post-ad success operation
                        console.log('Interstitial ad finished successfully');        
                    })
                    .catch(function(e) {
                        console.error(e.message);
                    });
                }
            }, 3300);

            return;
        }

        return;
    },

    updateRoadSpeed(b) {
        console.log(b,"hehehe");
        this.animState.speed = Math.abs(b) * GlobalConfig.RoadSpeed/this.road.height;
    },

    start () {
        this.startTime = new Date().getTime();
        /**********road move forward****************/
        this.road2.height = this.road.height;
        this.road2.y = this.road.height/2;
        // this.road.runAction(cc.repeatForever(cc.sequence(cc.moveBy(this.road.height/GlobalConfig.RoadSpeed, 0, -this.road.height),
        //     cc.callFunc(function() {
        //         this.road.y = 0;
        //     }, this))));
        var anim = this.road.getComponent(cc.Animation);
        anim.play("roadmove");
        this.animState = anim.getAnimationState('roadmove');
        this.animState.speed = GlobalConfig.RoadSpeed/this.road.height;

        this.distanceCount = 0;

        // this.distance.x = 0;
        // this.distance.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function() {
        //     this.distance.y = GlobalConfig.Pix2Distance - this.node.height;
        //     this.distanceCount += 100;
        //     this.distanceShow.string = this.distanceCount+"m";
        // }, this), cc.moveBy(GlobalConfig.Pix2Distance/GlobalConfig.RoadSpeed, 0, -GlobalConfig.Pix2Distance))));
    },

    // called every frame
    update: function (dt) {
    },

    beginTouch (event) {
        var x = event.getLocationInView().x - this.node.width/2;
        var y = this.node.height/2 - event.getLocationInView().y;

        var panDist = Math.sqrt((x - this.pan.x)*(x - this.pan.x) + (y - this.pan.y)*(y - this.pan.y));
        var panRadio = this.pan.width/2;

        if (panDist <= panRadio) {
            this.panTouched = true;
            this.pan.getComponent("controller").beginTouch(x, y);
        }
    },

    touching (event) {
        var x = event.getLocationInView().x - this.node.width/2;
        var y = this.node.height/2 - event.getLocationInView().y;

        var panDist = Math.sqrt((x - this.pan.x)*(x - this.pan.x) + (y - this.pan.y)*(y - this.pan.y));
        var panRadio = this.pan.width/2;

        if (panDist > panRadio && this.panTouched) {
            this.panTouched = false;
            this.pan.getComponent("controller").endTouch(x, y);
        } else if (panDist <= panRadio && !this.panTouched) {
            this.panTouched = true;
            this.pan.getComponent("controller").beginTouch(x, y);
        } else if (panDist <= panRadio && this.panTouched) {
            this.pan.getComponent("controller").touching(x, y);
        }

    },

    endTouch (event) {
        if (this.panTouched) {
            this.pan.getComponent("controller").endTouch();
        }
        this.panTouched = false;
    },
});

