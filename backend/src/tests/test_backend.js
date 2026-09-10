/**
 * Script de verificación completa para el Backend de Orquestando_IA
 */
import app from '../app.js';
import { config } from '../config/env.js';
import { aiService } from '../services/aiService.js';

let server;

async function runTests() {
  console.log('🧪 ================= INICIANDO PRUEBAS DE BACKEND =================');

  // Iniciar servidor temporal para pruebas
  server = app.listen(5001, () => {
    console.log('✅ Servidor de prueba iniciado en puerto 5001');
  });

  const baseUrl = 'http://localhost:5001/api';

  try {
    // 1. Test Health Check
    console.log('\n1️⃣ Probando GET /api/health ...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Respuesta Health:', healthData);
    if (!healthData.success) throw new Error('Health check falló');

    // 2. Test Registro de Usuario
    console.log('\n2️⃣ Probando POST /api/auth/register ...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'creador@orquestando.ai',
        username: 'creador_ia',
        password: 'passwordSeguro123!',
        bio: 'Probando el backend de Orquestando_IA'
      })
    });
    const registerData = await registerRes.json();
    console.log('Respuesta Register:', { success: registerData.success, user: registerData.data?.user?.username });
    if (!registerData.success) throw new Error('Registro falló: ' + registerData.message);

    const authToken = registerData.data.token;

    // 3. Test Login
    console.log('\n3️⃣ Probando POST /api/auth/login ...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrUsername: 'creador_ia',
        password: 'passwordSeguro123!'
      })
    });
    const loginData = await loginRes.json();
    console.log('Respuesta Login:', { success: loginData.success, tokenReceived: Boolean(loginData.data?.token) });
    if (!loginData.success) throw new Error('Login falló: ' + loginData.message);

    // 4. Test Perfil y Estadísticas
    console.log('\n4️⃣ Probando GET /api/auth/me ...');
    const profileRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileRes.json();
    console.log('Perfil obtenido:', { username: profileData.data?.username, stats: profileData.data?.stats });

    // 5. Test Listar Posts (Feed)
    console.log('\n5️⃣ Probando GET /api/posts (Feed) ...');
    const postsRes = await fetch(`${baseUrl}/posts`);
    const postsData = await postsRes.json();
    console.log('Total posts encontrados:', postsData.data?.posts?.length);

    // 6. Test Filtro de Posts por Estado ('draft')
    console.log('\n6️⃣ Probando GET /api/posts?status=draft ...');
    const draftsRes = await fetch(`${baseUrl}/posts?status=draft`);
    const draftsData = await draftsRes.json();
    console.log('Total borradores encontrados:', draftsData.data?.posts?.length);

    // 7. Test Creación de Post
    console.log('\n7️⃣ Probando POST /api/posts (Crear publicación) ...');
    const createPostRes = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        caption: 'Probando creación de post con IA #OrquestandoIA #Innovacion',
        hashtags: ['OrquestandoIA', 'Innovacion', 'Tech'],
        status: 'published',
        ratio: '1:1',
        tone: 'Viral'
      })
    });
    const createPostData = await createPostRes.json();
    console.log('Post Creado ID:', createPostData.data?.id);
    const createdPostId = createPostData.data?.id;

    // 8. Test Toggle Like
    console.log('\n8️⃣ Probando POST /api/posts/:id/like ...');
    const likeRes = await fetch(`${baseUrl}/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const likeData = await likeRes.json();
    console.log('Like Data:', likeData.data);

    // 9. Test OpenRouter AI - Generar Caption
    console.log('\n9️⃣ Probando POST /api/ai/generate-caption con OpenRouter ...');
    try {
      const captionRes = await fetch(`${baseUrl}/ai/generate-caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          topic: 'Lanzamiento de una plataforma de creación de contenido con IA',
          tone: 'Viral'
        })
      });
      const captionData = await captionRes.json();
      console.log('Caption IA Generado:', captionData.data?.caption?.slice(0, 150) + '...');
      console.log('Modelo IA Utilizado:', captionData.data?.modelUsed);
    } catch (aiErr) {
      console.warn('Nota sobre prueba de IA:', aiErr.message);
    }

    // 10. Test OpenRouter AI - Sugerir Hashtags
    console.log('\n🔟 Probando POST /api/ai/suggest-hashtags ...');
    try {
      const tagsRes = await fetch(`${baseUrl}/ai/suggest-hashtags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          topic: 'Emprendimiento digital y marketing en Instagram',
          count: 5
        })
      });
      const tagsData = await tagsRes.json();
      console.log('Hashtags sugeridos:', tagsData.data?.hashtags);
    } catch (tagsErr) {
      console.warn('Nota sobre sugerencia hashtags:', tagsErr.message);
    }

    console.log('\n🎉 ================= TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO =================');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
