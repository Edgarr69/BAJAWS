// Declaración para imports de efecto secundario de CSS (ej. `import "./globals.css"`).
// Sin esto, editores con noUncheckedSideEffectImports activo marcan ts(2882)
// aunque tsc y el build del proyecto pasen sin errores.
declare module '*.css';
