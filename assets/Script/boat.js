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
        bgm: {
            default: null,
            type: cc.AudioClip
        },
        crashAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.isFinish = false;
        this.bgMusicID = cc.audioEngine.play(this.bgm, true, 0.8);
    },

    turn (angle, dt) {
        if (this.isFinish) return;

        if (angle == 0) {
            return;
        }

        var turnSpeed = angle*GlobalConfig.TurnSpeed/180;

        var tmpRotation = this.node.rotation + dt * turnSpeed;

        console.log("turn ", angle, dt, tmpRotation);

        if (tmpRotation > 360) {
            tmpRotation %= 360;
        }
        while (tmpRotation < 0) {
            tmpRotation += 360;
        }

        if (tmpRotation < 90 || tmpRotation > 270) {
            this.node.rotation = tmpRotation;
        }
    },

    update (dt) {
        if (this.isFinish) return;

        var direction = 0;

        if (this.node.rotation < 90) {
            direction = this.node.rotation;
        }
        if (this.node.rotation > 270) {
            direction = this.node.rotation - 360;
        }

        if (this.node.rotation == 0) {
            return;
        }

        this.node.x += (GlobalConfig.RoadSpeed * Math.sin(2 * Math.PI / 360 * this.node.rotation)) * dt;;
        this.node.game.updateRoadSpeed(Math.cos(2 * Math.PI / 360 * this.node.rotation));
    },

    onCollisionEnter (other, self) {
        if (this.isFinish) return;

        if (this.bgMusicID != null) {
            cc.audioEngine.stop(this.bgMusicID);
        }
        cc.audioEngine.play(this.crashAudio, false, 1);
        
        this.isFinish = true;

        this.node.stopAllActions()

        var anim = this.node.getComponent(cc.Animation);
        anim.play("boatDisappear", 1.3);

        this.node.game.fail();
    },
});
