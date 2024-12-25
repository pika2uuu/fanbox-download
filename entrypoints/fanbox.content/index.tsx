import "./style.css";
import ReactDOM from 'react-dom/client';
import App from './App';

export default defineContentScript({
  matches: ['*://*.fanbox.cc/*'],
  main(ctx) {
      const ui = createIntegratedUi(ctx, {
          position: "inline",
          anchor: '[class*="Header__Wrapper"]',
          onMount:  (container) => {
              const wrapper = document.createElement("div");
              container.append(wrapper);

              const root = ReactDOM.createRoot(wrapper);
              root.render(<App />);
              return { root, wrapper };
          },
          onRemove: (elements) => {
              elements?.root.unmount();
              elements?.wrapper.remove();
          },
      });

      ui.mount();
  }
});