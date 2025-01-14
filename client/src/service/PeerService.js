class PeerService{

    peer;
    dataChannel;
    fileChannel;


    constructor(){
        if (!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:stun.l.google.com:5349",
                             "stun:stun1.l.google.com:3478",
                             "stun:stun1.l.google.com:5349",
                             "stun:stun2.l.google.com:19302",
                             "stun:stun2.l.google.com:5349"
                        ]
                    }
                ]
            })
        }
    }

    async getOffer(){
            if (this.peer){
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(new RTCSessionDescription(offer))
                return offer;
            }
    }

    async createAnswer(offer){
        if (this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans))
            return ans;
        }
    
    }

    async setAnswer(ans){
        if (this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }

     createDataChannel (type){
        if (this.peer){
            this.dataChannel = this.peer.createDataChannel(type);
            console.log(this.dataChannel);
            return this.dataChannel;
        }
    }
}

export default new PeerService();