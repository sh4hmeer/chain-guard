declare module 'vanta/dist/vanta.net.min' {
  const init: (opts: any) => { destroy?: () => void } | any;
  export default init;
}