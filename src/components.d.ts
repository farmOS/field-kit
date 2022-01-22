// This is just to make the Volar VSCode extension happy. See:
// https://github.com/johnsoncodehk/volar/tree/master/extensions/vscode-vue-language-features#usage
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']
  }
}

export {}