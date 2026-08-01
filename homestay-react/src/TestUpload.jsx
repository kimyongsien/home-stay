import { useState } from 'react';
import { uploadImage } from './services/cloudinary';
import { db } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TestUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [firestoreError, setFirestoreError] = useState(null);

  const handleTest = async () => {
    if (!file) return alert('Select a file first!');
    
    setUploading(true);
    setResult(null);
    setFirestoreError(null);

    try {
      // 1. Upload to Cloudinary
      console.log('📤 Uploading to Cloudinary...');
      const uploaded = await uploadImage(file);
      console.log('✅ Cloudinary URL:', uploaded.url);

      let docId = null;

      // 2. Save to Firestore (attempt)
      try {
        console.log('💾 Saving to Firestore...');
        const docRef = await addDoc(collection(db, 'test_uploads'), {
          image_url: uploaded.url,
          public_id: uploaded.public_id,
          uploaded_at: serverTimestamp()
        });
        docId = docRef.id;
        console.log('✅ Firestore Doc ID:', docId);
      } catch (fsErr) {
        console.warn('⚠️ Firestore error:', fsErr);
        setFirestoreError(fsErr.message);
      }
      
      setResult({
        url: uploaded.url,
        firestoreId: docId || 'Failed (Check Firestore Rules in Firebase Console)'
      });

      if (docId) {
        alert('🎉 SUCCESS! Both Cloudinary + Firebase working!');
      } else {
        alert('✅ Cloudinary Upload Succeeded! ⚠️ Firestore failed due to Rules/Permissions. See page details below.');
      }
    } catch (error) {
      console.error('❌ Cloudinary Upload Error:', error);
      alert('Cloudinary Upload Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>🧪 Test Firebase + Cloudinary</h2>
      
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      
      <button 
        onClick={handleTest}
        disabled={uploading || !file}
        style={{ 
          padding: '10px 20px', 
          marginTop: '10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {uploading ? '⏳ Testing...' : '🚀 Test Upload'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Cloudinary Upload Result</h3>
          <img src={result.url} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p><b>Firestore Doc ID:</b> {result.firestoreId}</p>
          <p style={{ wordBreak: 'break-all' }}><b>URL:</b> <a href={result.url} target="_blank" rel="noreferrer">{result.url}</a></p>
          
          {firestoreError && (
            <div style={{ padding: '12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginTop: '10px' }}>
              <strong>⚠️ Firestore Note:</strong> {firestoreError}<br/>
              <small>To allow Firestore saves, change rules in Firebase Console -&gt; Firestore Database -&gt; Rules to <code>allow read, write: if true;</code> for development.</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}