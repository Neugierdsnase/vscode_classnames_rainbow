> :warning: **Deprecation notice:** I am no longer maintaining this extension,
> since I myself am no longer using VSCode. Even before, I have used different
> strategies to deal with long class names. My favourite way was
> [this extension](https://marketplace.visualstudio.com/items?itemName=stivo.tailwind-fold),
> that let's you fold them whenever you are not working on styling.

> :electric_plug: **Shameless plug:** I have been devoloping
> [this browser extension](https://prompt-dress.com) lately, that lets you
> organise and manage you AI prompts. I'd be thrilled if you checked it out!

# classnames-rainbow README

An extension targeted at users of atomic css libraries (like tailwind-css) to
make it easier to visually distinguish individual class names.

## Features

Does only one thing: Colors your class names dynamically with rainbow colors.

Works with:

- html
- jsx
- tsx
- svelte
- astro

Please open an issue if you want/need other languages supported.

## Extension Settings

This extension contributes the following settings:

- `classnamesRainbow.colorIntensity`: set color intesity of the rainbow from 1
  to 10, default: 5
- `classnamesRainbow.minimumClassListLength`: set the minimum length for class
  lists for the extension to take effect from 1 to 20, default: 1

## Known Issues / Roadmap

Multilined class names are not yet supported.

Conditional class names within template literals are not yet supported.

## Release Notes

### 1.0.0

Initial release
