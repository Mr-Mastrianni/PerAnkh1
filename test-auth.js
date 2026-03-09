import { auth } from './src/firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';

async function testAuth() {
    try {
        console.log("Testing auth with:", "mastrianni11@gmail.com");
        const userCredential = await signInWithEmailAndPassword(auth, "mastrianni11@gmail.com", "testpassword");
        console.log("Success! User log in:", userCredential.user.uid);
    } catch (error) {
        console.error("Auth Error Code:", error.code);
        console.error("Auth Error Message:", error.message);
    }
}

testAuth();
