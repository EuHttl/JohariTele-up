const { db } = require('./database/init');

console.log('🔍 Verificando administradores no banco de dados...');

db.all('SELECT id, username, name FROM admins', (err, rows) => {
  if (err) {
    console.error('❌ Erro ao consultar administradores:', err);
    return;
  }

  if (rows.length === 0) {
    console.log('⚠️  Nenhum administrador encontrado no banco de dados');
    console.log('💡 Criando administrador padrão...');
    
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT INTO admins (username, password, name)
      VALUES ('admin', ?, 'Administrador')
    `, [defaultPassword], function(err) {
      if (err) {
        console.error('❌ Erro ao criar administrador:', err);
      } else {
        console.log('✅ Administrador padrão criado com sucesso!');
        console.log('👤 Usuário: admin');
        console.log('🔑 Senha: admin123');
      }
      process.exit(0);
    });
  } else {
    console.log('✅ Administradores encontrados:');
    rows.forEach(admin => {
      console.log(`👤 ID: ${admin.id} | Usuário: ${admin.username} | Nome: ${admin.name}`);
    });
    process.exit(0);
  }
});
