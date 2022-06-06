const settings = {
    username: "dotlitdev",
    repository: "dotlit",
    branch: "main",
    prefix: "src",
};

const __key = "ghSettings";

export const setupGithubAccess = async (token) => {
  if (typeof localStorage === "undefined") return "No localStorage available.";
  const display = fn => {
      const redacted = Object.assign({token:'••••••••••'}, settings, {})
      return ("`"+lit.utils.inspect(redacted)+"`")
             .split('\n')
             .map(l=>'> '+l)
             .join('\n')
  }

  const current = localStorage.getItem(__key);

  if (current) {
    let data = JSON.parse(current);
    if (data && data.token) return "Already set up.\n\n" + display();
  }

  token = token || prompt(
    `Enter a GitHub Access Token for:\n Repository: ${settings.username}/${settings.repository}`
  );

  if (token) {
    localStorage.setItem(__key, JSON.stringify({ ...settings, token }));
    return "All set up.\n\n" + display();
  }

  return "No **token** provided. Not set up.\n\n" + display();
}