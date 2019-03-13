// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        distance: {
            default: null,
            type: cc.Node,
        },
        distanceShow: {
            default: null,
            type: cc.Label,
        },
        stone: {
            default: null,
            type: cc.Prefab,
        },
        stone1: {
            default: null,
            type: cc.Prefab,
        },
        stone2: {
            default: null,
            type: cc.Prefab,
        },
        stone3: {
            default: null,
            type: cc.Prefab,
        },
        stone4: {
            default: null,
            type: cc.Prefab,
        },
        stone5: {
            default: null,
            type: cc.Prefab,
        },
        stone6: {
            default: null,
            type: cc.Prefab,
        },
        stone7: {
            default: null,
            type: cc.Prefab,
        },
        stone8: {
            default: null,
            type: cc.Prefab,
        },
        stone9: {
            default: null,
            type: cc.Prefab,
        },
        friendPan: {
            default: null,
            type: cc.Prefab,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rollCount = 0;
        this.RoadTimes = 4
        GlobalConfig.RoadSpeed = this.node.height / 1.5;
        GlobalConfig.Pix2Distance = this.RoadTimes * this.node.height;
    },

    start () {
        this.distance.active = false;
        this.randomFlag = 0;

        /**********place stone ********************/
        this.placeStone(1 * this.node.width/8-this.node.width/2, true, false);
        this.placeStone(3 * this.node.width/8-this.node.width/2, true, false);
        this.placeStone(5 * this.node.width/8-this.node.width/2, true, false);
        this.placeStone(7 * this.node.width/8-this.node.width/2, true, false);
    },

    placeFriendScore (records) {
        return;
        console.log("start place friend record", records);

        var _currentDistance = this.getDistance();
        var i = 0;
        for (i = records.length - 1; i >= 0; i--) {
            console.log("init record", i);

            var score = records[i].getScore();

            //for test
            //score = 50;

            if (i % 2 == 0) {
                this.placeOneScore(-this.node.width/2+100, score-_currentDistance, records[i].getPlayer().getName());
            } else {
                this.placeOneScore(this.node.width/2-100, score-_currentDistance, records[i].getPlayer().getName());
            }
        }
    },

    placeOneScore(posx, dist, photo) {
        console.log("init record", posx, dist, dist*GlobalConfig.Pix2Distance, this.node.height, photo);
        var newStone = cc.instantiate(this.friendPan);
        newStone.getChildByName("name").getComponent(cc.Label).string = photo;
        //newStone.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(photo);

        this.node.addChild(newStone, 10);

        newStone.setPosition(posx, dist*GlobalConfig.Pix2Distance/100 + this.node.height/2);
    },

    placeStone (pos, isFirst, rever) {
        if (isFirst) {
            var timeRand = Math.random() * 5000 + 1000;
            console.log("place stone", pos, timeRand);
            setTimeout(this.placeStone.bind(this), timeRand, pos, false, rever);
            return;
        }

        this.randomFlag++;
        if (this.randomFlag%4 == 0) {
            var timeRand = Math.random() * 2000 + 3000;
            setTimeout(this.placeStone.bind(this), timeRand, pos, false, false);
            return;
        }

        var cars = [this.stone, this.stone1, this.stone2, 
            this.stone3, this.stone4, this.stone5,
            this.stone6, this.stone7, this.stone8,
            this.stone9];

        console.log("init stone");
        var randomCarNum = parseInt(Math.random()*cars.length);
        var newStone = cc.instantiate(cars[randomCarNum]);

        this.node.addChild(newStone, 10);
        if (rever) {
            newStone.rotation = 180;
        }

        //var pos = (this.node.width - 500)*Math.random() - this.node.width/2;
        newStone.setPosition(pos, this.node.height/2+500-this.node.y);

        var randSpeed = Math.random()*GlobalConfig.RoadSpeed/2 + GlobalConfig.RoadSpeed/5;
        if (rever) {
            randSpeed += GlobalConfig.RoadSpeed * 3/2;
        }
        newStone.ppos = pos;
        newStone.rrandSpeed = randSpeed;
        var runTime = (this.node.height+500)/(GlobalConfig.RoadSpeed - randSpeed);
        var distance = runTime * randSpeed;
        newStone.runAction(cc.moveBy(runTime, 0, distance));

        // if (randomCarNum == 1) {
        //     setTimeout(() => {
        //         cc.audioEngine.play(this.passAudio, false, 0.2);
        //     }, (runTime - 3)*1000);
        // }

        // var timeRand = (Math.random() * 3000 + 2000)/GlobalConfig.RoadSpeed * 1000;
        // console.log("place stone", pos, timeRand);
        // setTimeout(this.placeStone.bind(this), timeRand, pos, false, rever);
    },

    onRoadUpdate () {
        this.rollCount++;

        if (this.rollCount%this.RoadTimes == 0) {
            this.distanceShow.string = parseInt(this.rollCount/this.RoadTimes)+"00m";
            this.distance.active = true;

            if (this.rollCount/this.RoadTimes % 10 == 0) {
                GlobalConfig.RoadSpeed *= 1.2;
            }
        } else {
            this.distance.active = false;
        }

        console.log("car num", this.node.children.length);
        for(var j = 2,len = this.node.children.length; j < len; j++){
            this.node.children[j].y -= this.node.height;

            if (!this.node.children[j].rrandSpeed) {
                continue;
            }

            this.node.children[j].stopAllActions();

            var runTime = (this.node.height/2+this.node.children[j].y+500)/(GlobalConfig.RoadSpeed - this.node.children[j].rrandSpeed);
            var distance = runTime * this.node.children[j].rrandSpeed;
            this.node.children[j].runAction(cc.sequence(cc.moveBy(runTime, 0, distance), 
            cc.callFunc(function(s) {
                console.log("one destroy");
                s.destroy();

                var timeRand = Math.random() * 6000;
                setTimeout(this.placeStone.bind(this), timeRand, s.ppos, false, false);
            }, this, this.node.children[j])));
        }
    },

    getDistance () {
        return parseInt((this.rollCount*this.node.height-this.node.y)/GlobalConfig.Pix2Distance*100);
    },

    // update (dt) {},
});
