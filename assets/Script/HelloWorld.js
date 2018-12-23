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

        return;

        FBInstant.player.getConnectedPlayersAsync()
            .then(function(players) {
                var friends = {};
                for (p in players) {
                    friends[players[p].getID()] = players[p];
                }
                friends[FBInstant.player.getID()] = FBInstant.player;

                self.friendsInfo = friends;

                //get friends rank info
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                        var response = xhr.responseText;
                        
                        self.rankInfo = JSON.parse(response).content;
                        //[{id:iii,score:sss}]

                        //find best friend
                        var bestFriend = "";
                        var max = 0;
                        for (var p in self.rankInfo) {
                            if (max == 0) {
                                bestFriend = self.rankInfo[p].userid;
                                max = self.rankInfo[p].score;
                                continue;
                            }

                            if (max < self.rankInfo[p].score) {
                                bestFriend = self.rankInfo[p].userid;
                                max = self.rankInfo[p].score;
                            }
                        }

                        //replace wheel photo
                        console.log(bestFriend, friends, self.rankInfo);
                        self.bestPhoto.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(friends[bestFriend].getPhoto());
                    }
                };
                xhr.open("POST", "https://"+GlobalConfig.Domain+"/score/query", true);
                console.log("send ", Object.keys(friends));
                xhr.send(JSON.stringify(Object.keys(friends)));
            });
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
    
                            rankLableShow += (entry.getScore())+"m    "+entry.getPlayer().getName()+"\n";
    
                            self.rankShow.string = rankLableShow;
                        });
                    });
            });

            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
        };
        xhr.open("POST", "https://"+GlobalConfig.Domain+"/score/add", true);

        xhr.send(JSON.stringify({"userid":FBInstant.player.getID(),"score":this.road.getComponent("road").getDistance()}));

        console.log(this.rankInfo);
        if (this.rankInfo) {
            for (var i in this.rankInfo) {
                if (this.rankInfo[i].userid == FBInstant.player.getID() && this.rankInfo[i].score < this.road.getComponent("road").getDistance()) {
                    this.rankInfo[i].score = this.road.getComponent("road").getDistance();
                    break;
                }
            }

            this.finalRank = this.rankInfo.sort(function(a, b){
                return a.score - b.score;
            });

            console.log(this.finalRank, this.friendsInfo);
            var rankLableShow = "";
            for (var i in this.finalRank) {
                rankLableShow += (this.finalRank[i].score)+"m    "+this.friendsInfo[this.finalRank[i].userid].getName()+"\n";
            }

            this.rankShow.string = rankLableShow;
        }
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

