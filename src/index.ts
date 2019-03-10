import yaml from "js-yaml";

let mdUrl = window.location.hash.substring(1);
if (mdUrl.length === 0) {
    mdUrl = "https://raw.githubusercontent.com/patarapolw/reveal-md/master/README.md";
}

interface ISettings {
    theme: string;
    highlightTheme: string;
    transition: string;
    revealOptions: any;
}

fetch(`https://cors-anywhere.herokuapp.com/${mdUrl}`).then((r) => r.text()).then((md) => {
    md = cleanLocalUrl(md);

    const markdownSections = document.getElementById("markdownSections") as HTMLDivElement;
    let slides = md.split(/^---$/gm);
    let additionalSettings: ISettings = {
        theme: "white",
        highlightTheme: "zenburn"
    } as ISettings;

    if (slides[0].trim() === "") {
        try {
            additionalSettings = yaml.safeLoad(slides[1]);
            slides = slides.slice(2);
// tslint:disable-next-line: no-empty
        } catch (e) {}
    }

    (document.getElementById("cssTheme") as HTMLLinkElement).href = `css/theme/${additionalSettings.theme}.css`;
    (document.getElementById("cssHighlight") as HTMLLinkElement).href =
        `lib/css/${additionalSettings.highlightTheme}.css`;

    if (additionalSettings.transition) {
        additionalSettings.revealOptions = additionalSettings.revealOptions || {};
        Object.assign(additionalSettings.revealOptions, {
            transition: additionalSettings.transition
        });
    }

    slides.forEach((slide) => {
        const section = document.createElement("section");
        section.setAttribute("data-markdown", "");

        const secs = slide.split(/^--$/gm);
        if (secs.length > 1) {
            secs.forEach((sec) => {
                const subSection = document.createElement("section");
                subSection.setAttribute("data-markdown", "");

                const script = document.createElement("script");
                script.setAttribute("type", "text/template");
                script.innerHTML = sec;

                subSection.append(script);
                section.append(subSection);
            });
        } else {
            const script = document.createElement("script");
            script.setAttribute("type", "text/template");
            script.innerHTML = slide;

            section.appendChild(script);
        }

        markdownSections.appendChild(section);
    });

    (window as any).Reveal.initialize({
        ...(additionalSettings.revealOptions || {}),
        dependencies: [
            { src: "plugin/markdown/marked.js" },
            { src: "plugin/markdown/markdown.js" },
            { src: "plugin/notes/notes.js", async: true },
            { src: "plugin/highlight/highlight.js", async: true, callback() {
                (window as any).hljs.initHighlightingOnLoad();
            } }
        ]
    });

    (document.getElementById("jsStyle") as HTMLStyleElement).innerHTML = `
    img, video, iframe {
        height: ${window.innerHeight * 0.8}px !important;
        max-width: ${window.innerWidth * 0.8}px !important;
    }

    .present {
        max-height: ${window.innerHeight * 0.9}px;
        overflow-y: scroll;
    }`;
});

function cleanLocalUrl(md: string): string {
    const mRegex = /\[[^\]]*\]\(([^)]*)\)/g;
    let m = mRegex.exec(md);

    while (m !== null) {
        md = md.replace(m[1], new URL(m[1], mdUrl).href);
        m = mRegex.exec(md);
    }

    return md;
}
