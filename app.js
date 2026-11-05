/**
 * app.js — versão publicada (GitHub Pages) do SOS Vital
 * 1) registra o service worker (app instalável e funciona sem internet)
 * 2) mostra o aviso "Instalar app" (Android) ou a dica do iPhone
 * 3) conta uso e salva o cadastro neste celular (sem servidor)
 */
(function () {
  // ---------- 1) Service worker ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  function ler(k) { try { return +localStorage.getItem("sosvital_" + k) || 0; } catch (e) { return 0; } }
  function soma(k) { try { localStorage.setItem("sosvital_" + k, ler(k) + 1); } catch (e) {} }

  // ---------- 2) Aviso de instalação ----------
  var instalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  var ua = navigator.userAgent || "";
  var ehIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var dispensado = false;
  try { dispensado = sessionStorage.getItem("sosvital_banner") === "1"; } catch (e) {}
  var main = document.querySelector("main");

  function banner(html, comBotao) {
    if (!main || instalado || dispensado || document.getElementById("banner-instalar")) return null;
    var b = document.createElement("div");
    b.id = "banner-instalar";
    b.style.cssText = "margin:14px 0 0;padding:12px 14px;border-radius:14px;background:var(--teal-tint);border:1px solid var(--line);display:flex;gap:10px;align-items:center;font-size:.84rem;line-height:1.4;color:var(--teal-ink)";
    b.innerHTML = '<div style="flex:1">' + html + "</div>" +
      (comBotao ? '<button id="btn-instalar" style="border:0;border-radius:10px;padding:9px 12px;background:var(--teal);color:#fff;font-weight:800;font-family:inherit">Instalar</button>' : "") +
      '<button id="btn-fechar-banner" aria-label="Fechar" style="border:0;background:none;color:var(--ink-soft);font-size:1.1rem">✕</button>';
    main.insertBefore(b, main.firstChild);
    document.getElementById("btn-fechar-banner").onclick = function () {
      b.remove(); try { sessionStorage.setItem("sosvital_banner", "1"); } catch (e) {}
    };
    return b;
  }

  if (ehIOS) {
    banner("<b>Instale no iPhone:</b> no Safari, toque em <b>Compartilhar</b> (□↑) e depois em <b>Adicionar à Tela de Início</b>.", false);
  } else {
    window.addEventListener("beforeinstallprompt", function (ev) {
      ev.preventDefault();
      var b = banner("<b>Instale o SOS Vital</b> no seu celular — grátis, sem loja.", true);
      if (!b) return;
      document.getElementById("btn-instalar").onclick = function () {
        ev.prompt();
        ev.userChoice.finally(function () { b.remove(); });
      };
    });
  }

  // ---------- 3) Contadores e cadastro neste celular ----------
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener("click", function () { soma("chamadas"); });
  });

  document.querySelectorAll("[data-contador]").forEach(function (el) {
    el.textContent = ler(el.getAttribute("data-contador"));
  });

  var form = document.getElementById("form-perfil");
  if (form) {
    var msg = document.getElementById("msg-perfil");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = (form.nome.value || "").trim();
      if (!nome) {
        msg.innerHTML = '<div class="mensagem-flash erro">Escreva ao menos um nome ou apelido.</div>';
        return;
      }
      var dados = { nome: nome, idade: form.idade.value || null,
        fez_curso: (form.querySelector('input[name="fez_curso"]:checked') || {}).value || "nao",
        criado_em: new Date().toISOString() };
      try { localStorage.setItem("sosvital_perfil", JSON.stringify(dados)); } catch (e) {}
      soma("cadastros");
      msg.innerHTML = '<div class="mensagem-flash sucesso">Cadastro salvo — obrigado por participar da pesquisa!</div>';
      form.reset();
    });
  }
})();
