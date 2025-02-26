use leptos::view;
use leptos::mount;

use portfolio::canvas::Canvas;

fn main() {
    console_error_panic_hook::set_once();
    mount::mount_to_body(|| view! { <Canvas /> });
}