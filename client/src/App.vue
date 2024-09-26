<script setup lang="ts">
import { ref } from 'vue';
const socket = new WebSocket("wss://192.168.31.248/")

const messages = ref<string[]>([])
const localStream = ref<MediaStream | null>(null)

const localvideo = ref<HTMLVideoElement | null>(null)
const remotevideo = ref<HTMLVideoElement | null>(null)

let peerConnection: RTCPeerConnection | null = null


const iceConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

socket.onmessage =async (message) => {{
  const data = JSON.parse(message.data);
  
  if (data.type === 'offer') {
    await handleOffer(data.offer);
  } else if (data.type === 'answer') {
    await handleAnswer(data.answer);
  } else if (data.type === 'ice-candidate') {
    await handleIceCandidate(data.candidate);
  }
};
}

async function createOffer(){
  peerConnection = new RTCPeerConnection(iceConfig);
  if(localStream.value){
    if(!peerConnection) return
    localStream.value.getTracks().forEach(track => {
      peerConnection?.addTrack(track, localStream.value!);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    peerConnection.ontrack = (event) => {
      if(remotevideo.value){
        remotevideo.value.srcObject = event.streams[0];
        remotevideo.value.play();
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: 'offer', offer: offer }));

  }
}



async function handleOffer(offer:RTCSessionDescriptionInit){
  peerConnection = new RTCPeerConnection(iceConfig);
  if(localStream.value){
    if(!peerConnection) return
    localStream.value.getTracks().forEach(track => {
      peerConnection?.addTrack(track, localStream.value!);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    peerConnection.ontrack = (event) => {
      if(remotevideo.value){
        remotevideo.value.srcObject = event.streams[0];
        remotevideo.value.play();
      }
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: 'answer', answer: answer }));
  }
}

async function handleAnswer(answer:RTCSessionDescriptionInit){
  if(peerConnection){
    await peerConnection.setRemoteDescription(answer)
  }
}


async function handleIceCandidate(candidate:RTCIceCandidateInit){
  if(peerConnection){
    await peerConnection.addIceCandidate(candidate)
  }
}





async function startLocalStrean() {
  try{
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  localStream.value = stream
  if(localvideo.value){
    localvideo.value.srcObject = stream
    localvideo.value.play()
  }
}catch(err){
    alert(err)
  }

  
}

async function start(){
  await startLocalStrean()
  await createOffer()
}


start()

</script>

<template>
  

  <div>
    <h2>Local Video</h2>
    <video ref="localvideo" ></video>
  </div>


  <div>
    <h2>Remote Video</h2>
    <video ref="remotevideo" ></video>
  </div>






  <div>
    <h2>messages</h2>
    <ul>
    <li v-for="message in messages">
      {{ message }}
    </li>

    </ul>
  </div>


  <form>
    <input name="mesa" type="text">
    <button>Send</button>
  </form>

</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
