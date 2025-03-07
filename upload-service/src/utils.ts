const MAX_LENGTH = 5;

export function generateId() {
  const string = "1234567890qwertyuiopasdfghjklzxcvbnm";
  let ans = "";
  for (let i = 0; i < MAX_LENGTH; i++) {
    ans += string[Math.floor(Math.random() * string.length)];
  }
  return ans;
}
