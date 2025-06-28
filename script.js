const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
const SECRET_KEY = "super-secure-passphrase"; // You can change this later

async function signUp() {
  const { error } = await supabase.auth.signUp({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  });
  alert(error ? error.message : "Signed up! Please check your email to verify.");
}

async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  });
  if (error) return alert(error.message);
  currentUser = data.user;
  alert("Logged in!");
}

async function saveData() {
  const text = document.getElementById("vaultInput").value;
  const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  const user = (await supabase.auth.getUser()).data.user;
  const { error } = await supabase.from('vault_data').insert({
    user_id: user.id,
    encrypted_data: encrypted
  });
  alert(error ? error.message : "Data saved securely!");
}

async function loadData() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from('vault_data')
    .select('encrypted_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || data.length === 0) {
    document.getElementById("output").innerText = "No data found.";
    return;
  }

  const decrypted = CryptoJS.AES.decrypt(data[0].encrypted_data, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  document.getElementById("output").innerText = "Decrypted: " + decrypted;
}
