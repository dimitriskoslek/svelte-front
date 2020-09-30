
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.28.0 */

    const file = "src/components/Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (20:36) 
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/icons/menu-icon-closed.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "menu_icon");
    			attr_dev(img, "class", "svelte-1gfoq6f");
    			add_location(img, file, 20, 12, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*toggleMenu*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(20:36) ",
    		ctx
    	});

    	return block;
    }

    // (18:8) {#if menuOpen == true}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/icons/menu-icon-open.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "menu_icon");
    			attr_dev(img, "class", "svelte-1gfoq6f");
    			add_location(img, file, 18, 12, 418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*toggleMenu*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:8) {#if menuOpen == true}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#if menuOpen == true }
    function create_if_block(ctx) {
    	let ul;
    	let each_value = /*menuItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1gfoq6f");
    			add_location(ul, file, 25, 12, 710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 2) {
    				each_value = /*menuItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(25:8) {#if menuOpen == true }",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#each menuItems as menuItem}
    function create_each_block(ctx) {
    	let li;
    	let t_value = /*menuItem*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1gfoq6f");
    			add_location(li, file, 27, 20, 781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:16) {#each menuItems as menuItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	function select_block_type(ctx, dirty) {
    		if (/*menuOpen*/ ctx[0] == true) return create_if_block_1;
    		if (/*menuOpen*/ ctx[0] == false) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*menuOpen*/ ctx[0] == true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			if (img.src !== (img_src_value = "/icons/site-logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Poll Ninja Logo");
    			attr_dev(img, "class", "svelte-1gfoq6f");
    			add_location(img, file, 13, 12, 245);
    			attr_dev(a, "href", "http://localhost:5000/");
    			add_location(a, file, 12, 8, 199);
    			attr_dev(div0, "class", "site-logo svelte-1gfoq6f");
    			add_location(div0, file, 11, 4, 167);
    			attr_dev(div1, "id", "menu-toggle");
    			attr_dev(div1, "class", "svelte-1gfoq6f");
    			toggle_class(div1, "active", /*menuOpen*/ ctx[0]);
    			add_location(div1, file, 16, 4, 328);
    			attr_dev(div2, "id", "menu");
    			attr_dev(div2, "class", "svelte-1gfoq6f");
    			add_location(div2, file, 23, 4, 650);
    			attr_dev(header, "class", "svelte-1gfoq6f");
    			add_location(header, file, 10, 0, 154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(header, t1);
    			append_dev(header, div2);
    			if (if_block1) if_block1.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (if_block0) if_block0.p(ctx, dirty);

    			if (dirty & /*menuOpen*/ 1) {
    				toggle_class(div1, "active", /*menuOpen*/ ctx[0]);
    			}

    			if (/*menuOpen*/ ctx[0] == true) if_block1.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let menuOpen = false;
    	let menuItems = ["Polls", "Users"];

    	const toggleMenu = () => {
    		
    	}; //menuOpen = !menuOpen

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ menuOpen, menuItems, toggleMenu });

    	$$self.$inject_state = $$props => {
    		if ("menuOpen" in $$props) $$invalidate(0, menuOpen = $$props.menuOpen);
    		if ("menuItems" in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuOpen, menuItems, toggleMenu];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.28.0 */

    const file$1 = "src/components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Copyright 2020 @ dimitriskl";
    			attr_dev(div, "class", "copyright svelte-1ek7k86");
    			add_location(div, file$1, 1, 4, 13);
    			attr_dev(footer, "class", "svelte-1ek7k86");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/shared/Tabs.svelte generated by Svelte v3.28.0 */
    const file$2 = "src/shared/Tabs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (11:8) {#each items as item}
    function create_each_block$1(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-yt0tfm");
    			toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			add_location(div, file$2, 12, 16, 302);
    			attr_dev(li, "class", "svelte-yt0tfm");
    			add_location(li, file$2, 11, 12, 236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[4] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-yt0tfm");
    			add_location(ul, file$2, 9, 4, 189);
    			attr_dev(div, "class", "tabs svelte-yt0tfm");
    			add_location(div, file$2, 8, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, items, activeItem*/ 7) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	const dispatch = createEventDispatcher();
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ["items", "activeItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => dispatch("tabChange", item);

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem, dispatch, click_handler];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !("items" in props)) {
    			console.warn("<Tabs> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !("activeItem" in props)) {
    			console.warn("<Tabs> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const PollStore = writable([
    	{
    		id: 1,
    		question: 'Python or Javascript?',
    		answerA: 'Python',
    		answerB: 'Javascript',
    		votesA: 9,
    		votesB: 15
    	}
    ]);

    /* src/shared/Button.svelte generated by Svelte v3.28.0 */

    const file$3 = "src/shared/Button.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-1129bki"));
    			toggle_class(button, "flat", /*flat*/ ctx[1]);
    			toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			add_location(button, file$3, 7, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*type*/ ctx[0]) + " svelte-1129bki"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*type, flat*/ 3) {
    				toggle_class(button, "flat", /*flat*/ ctx[1]);
    			}

    			if (dirty & /*type, inverse*/ 5) {
    				toggle_class(button, "inverse", /*inverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { type = "primary" } = $$props;
    	let { flat = false } = $$props;
    	let { inverse = false } = $$props;
    	const writable_props = ["type", "flat", "inverse"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("inverse" in $$props) $$invalidate(2, inverse = $$props.inverse);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, flat, inverse });

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("inverse" in $$props) $$invalidate(2, inverse = $$props.inverse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, flat, inverse, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { type: 0, flat: 1, inverse: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CreatePollForm.svelte generated by Svelte v3.28.0 */
    const file$4 = "src/components/CreatePollForm.svelte";

    // (63:4) <Button type="secondary" flat={true} inverse={false}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Poll");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(63:4) <Button type=\\\"secondary\\\" flat={true} inverse={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div0;
    	let t3_value = /*errors*/ ctx[1].question + "";
    	let t3;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let t8_value = /*errors*/ ctx[1].answerA + "";
    	let t8;
    	let t9;
    	let div5;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let div4;
    	let t13_value = /*errors*/ ctx[1].answerB + "";
    	let t13;
    	let t14;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "secondary",
    				flat: true,
    				inverse: false,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Poll Question";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Answer A";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Answer B";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div4 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			create_component(button.$$.fragment);
    			attr_dev(label0, "for", "question");
    			attr_dev(label0, "class", "svelte-kn6398");
    			add_location(label0, file$4, 48, 8, 1460);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "question");
    			attr_dev(input0, "class", "svelte-kn6398");
    			add_location(input0, file$4, 49, 8, 1512);
    			attr_dev(div0, "class", "error svelte-kn6398");
    			add_location(div0, file$4, 50, 8, 1583);
    			attr_dev(div1, "class", "form-field svelte-kn6398");
    			add_location(div1, file$4, 47, 4, 1427);
    			attr_dev(label1, "for", "answer-a");
    			attr_dev(label1, "class", "svelte-kn6398");
    			add_location(label1, file$4, 53, 8, 1674);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "answer-a");
    			attr_dev(input1, "class", "svelte-kn6398");
    			add_location(input1, file$4, 54, 8, 1721);
    			attr_dev(div2, "class", "error svelte-kn6398");
    			add_location(div2, file$4, 55, 8, 1791);
    			attr_dev(div3, "class", "form-field svelte-kn6398");
    			add_location(div3, file$4, 52, 4, 1641);
    			attr_dev(label2, "for", "answer-b");
    			attr_dev(label2, "class", "svelte-kn6398");
    			add_location(label2, file$4, 58, 8, 1881);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "answer-b");
    			attr_dev(input2, "class", "svelte-kn6398");
    			add_location(input2, file$4, 59, 8, 1928);
    			attr_dev(div4, "class", "error svelte-kn6398");
    			add_location(div4, file$4, 60, 8, 1998);
    			attr_dev(div5, "class", "form-field svelte-kn6398");
    			add_location(div5, file$4, 57, 4, 1848);
    			attr_dev(form, "class", "svelte-kn6398");
    			add_location(form, file$4, 46, 0, 1375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*fields*/ ctx[0].question);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*fields*/ ctx[0].answerA);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(form, t9);
    			append_dev(form, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t11);
    			append_dev(div5, input2);
    			set_input_value(input2, /*fields*/ ctx[0].answerB);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, t13);
    			append_dev(form, t14);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*submitHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1 && input0.value !== /*fields*/ ctx[0].question) {
    				set_input_value(input0, /*fields*/ ctx[0].question);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t3_value !== (t3_value = /*errors*/ ctx[1].question + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*fields*/ 1 && input1.value !== /*fields*/ ctx[0].answerA) {
    				set_input_value(input1, /*fields*/ ctx[0].answerA);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t8_value !== (t8_value = /*errors*/ ctx[1].answerA + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*fields*/ 1 && input2.value !== /*fields*/ ctx[0].answerB) {
    				set_input_value(input2, /*fields*/ ctx[0].answerB);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t13_value !== (t13_value = /*errors*/ ctx[1].answerB + "")) set_data_dev(t13, t13_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CreatePollForm", slots, []);
    	let dispatch = createEventDispatcher();
    	let fields = { question: "", answerA: "", answerB: "" };
    	let errors = { question: "", answerA: "", answerB: "" };
    	let valid = false;

    	const submitHandler = () => {
    		valid = true;

    		// Validate question
    		if (fields.question.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, errors.question = "Question must be at least 5 characters long", errors);
    		} else {
    			$$invalidate(1, errors.question = "", errors);
    		}

    		// Validate answerA
    		if (fields.answerA.trim().length < 1) {
    			valid = false;
    			$$invalidate(1, errors.answerA = "Answer A cannot be empty", errors);
    		} else {
    			$$invalidate(1, errors.answerA = "", errors);
    		}

    		// Validate answerA
    		if (fields.answerB.trim().length < 1) {
    			valid = false;
    			$$invalidate(1, errors.answerB = "Answer A cannot be empty", errors);
    		} else {
    			$$invalidate(1, errors.answerB = "", errors);
    		}

    		//
    		if (valid) {
    			let poll = {
    				...fields,
    				votesA: 0,
    				votesB: 0,
    				id: Math.random()
    			};

    			// save poll to Store
    			PollStore.update(currentPolls => {
    				return [poll, ...currentPolls];
    			});

    			dispatch("add");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CreatePollForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.question = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.answerA = this.value;
    		$$invalidate(0, fields);
    	}

    	function input2_input_handler() {
    		fields.answerB = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		PollStore,
    		createEventDispatcher,
    		dispatch,
    		Button,
    		fields,
    		errors,
    		valid,
    		submitHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    		if ("valid" in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		errors,
    		submitHandler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class CreatePollForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreatePollForm",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/shared/Card.svelte generated by Svelte v3.28.0 */

    const file$5 = "src/shared/Card.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-y0np62");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/components/PollDetails.svelte generated by Svelte v3.28.0 */
    const file$6 = "src/components/PollDetails.svelte";

    // (54:12) <Button type="primary" flat={true} inverse={false} on:click={() => handleDelete(poll.id)}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(54:12) <Button type=\\\"primary\\\" flat={true} inverse={false} on:click={() => handleDelete(poll.id)}>",
    		ctx
    	});

    	return block;
    }

    // (41:0) <Card>
    function create_default_slot$1(ctx) {
    	let div5;
    	let h3;
    	let t0_value = /*poll*/ ctx[0].question + "";
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let div0;
    	let t5;
    	let span0;
    	let t6_value = /*poll*/ ctx[0].answerA + "";
    	let t6;
    	let t7;
    	let t8_value = /*poll*/ ctx[0].votesA + "";
    	let t8;
    	let t9;
    	let t10;
    	let div3;
    	let div2;
    	let t11;
    	let span1;
    	let t12_value = /*poll*/ ctx[0].answerB + "";
    	let t12;
    	let t13;
    	let t14_value = /*poll*/ ctx[0].votesB + "";
    	let t14;
    	let t15;
    	let t16;
    	let div4;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "primary",
    				flat: true,
    				inverse: false,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text("Total votes: ");
    			t3 = text(/*totalVotes*/ ctx[1]);
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t5 = space();
    			span0 = element("span");
    			t6 = text(t6_value);
    			t7 = text(" (");
    			t8 = text(t8_value);
    			t9 = text(")");
    			t10 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t11 = space();
    			span1 = element("span");
    			t12 = text(t12_value);
    			t13 = text(" (");
    			t14 = text(t14_value);
    			t15 = text(")");
    			t16 = space();
    			div4 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(h3, "class", "svelte-p5smng");
    			add_location(h3, file$6, 42, 8, 1103);
    			attr_dev(p, "class", "svelte-p5smng");
    			add_location(p, file$6, 43, 8, 1136);
    			attr_dev(div0, "class", "percent percent-a svelte-p5smng");
    			set_style(div0, "width", /*$tweenedA*/ ctx[2] + "%");
    			add_location(div0, file$6, 45, 12, 1252);
    			attr_dev(span0, "class", "svelte-p5smng");
    			add_location(span0, file$6, 46, 12, 1330);
    			attr_dev(div1, "class", "answer svelte-p5smng");
    			add_location(div1, file$6, 44, 8, 1177);
    			attr_dev(div2, "class", "percent percent-b svelte-p5smng");
    			set_style(div2, "width", /*$tweenedB*/ ctx[3] + "%");
    			add_location(div2, file$6, 49, 12, 1472);
    			attr_dev(span1, "class", "svelte-p5smng");
    			add_location(span1, file$6, 50, 12, 1550);
    			attr_dev(div3, "class", "answer svelte-p5smng");
    			add_location(div3, file$6, 48, 8, 1397);
    			attr_dev(div4, "class", "delete svelte-p5smng");
    			add_location(div4, file$6, 52, 8, 1617);
    			attr_dev(div5, "class", "poll");
    			add_location(div5, file$6, 41, 4, 1076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h3);
    			append_dev(h3, t0);
    			append_dev(div5, t1);
    			append_dev(div5, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t5);
    			append_dev(div1, span0);
    			append_dev(span0, t6);
    			append_dev(span0, t7);
    			append_dev(span0, t8);
    			append_dev(span0, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t11);
    			append_dev(div3, span1);
    			append_dev(span1, t12);
    			append_dev(span1, t13);
    			append_dev(span1, t14);
    			append_dev(span1, t15);
    			append_dev(div5, t16);
    			append_dev(div5, div4);
    			mount_component(button, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*poll*/ 1) && t0_value !== (t0_value = /*poll*/ ctx[0].question + "")) set_data_dev(t0, t0_value);
    			if (!current || dirty & /*totalVotes*/ 2) set_data_dev(t3, /*totalVotes*/ ctx[1]);

    			if (!current || dirty & /*$tweenedA*/ 4) {
    				set_style(div0, "width", /*$tweenedA*/ ctx[2] + "%");
    			}

    			if ((!current || dirty & /*poll*/ 1) && t6_value !== (t6_value = /*poll*/ ctx[0].answerA + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*poll*/ 1) && t8_value !== (t8_value = /*poll*/ ctx[0].votesA + "")) set_data_dev(t8, t8_value);

    			if (!current || dirty & /*$tweenedB*/ 8) {
    				set_style(div2, "width", /*$tweenedB*/ ctx[3] + "%");
    			}

    			if ((!current || dirty & /*poll*/ 1) && t12_value !== (t12_value = /*poll*/ ctx[0].answerB + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*poll*/ 1) && t14_value !== (t14_value = /*poll*/ ctx[0].votesB + "")) set_data_dev(t14, t14_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(41:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, poll, $tweenedB, $tweenedA, totalVotes*/ 8207) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $tweenedA;
    	let $tweenedB;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PollDetails", slots, []);
    	let { poll } = $$props;
    	const tweenedA = tweened(0);
    	validate_store(tweenedA, "tweenedA");
    	component_subscribe($$self, tweenedA, value => $$invalidate(2, $tweenedA = value));
    	const tweenedB = tweened(0);
    	validate_store(tweenedB, "tweenedB");
    	component_subscribe($$self, tweenedB, value => $$invalidate(3, $tweenedB = value));

    	const handleVote = (option, id) => {
    		PollStore.update(currentPolls => {
    			let copiedPolls = [...currentPolls];
    			let upvotedPoll = copiedPolls.find(poll => poll.id == id);

    			if (option === "a") {
    				upvotedPoll.votesA++;
    			}

    			if (option === "b") {
    				upvotedPoll.votesB++;
    			}

    			return copiedPolls;
    		});
    	};

    	const handleDelete = id => {
    		PollStore.update(currentPolls => {
    			return currentPolls.filter(poll => poll.id != id);
    		});
    	};

    	const writable_props = ["poll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PollDetails> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleVote("a", poll.id);
    	const click_handler_1 = () => handleVote("b", poll.id);
    	const click_handler_2 = () => handleDelete(poll.id);

    	$$self.$$set = $$props => {
    		if ("poll" in $$props) $$invalidate(0, poll = $$props.poll);
    	};

    	$$self.$capture_state = () => ({
    		PollStore,
    		Card,
    		Button,
    		tweened,
    		poll,
    		tweenedA,
    		tweenedB,
    		handleVote,
    		handleDelete,
    		totalVotes,
    		percentA,
    		percentB,
    		$tweenedA,
    		$tweenedB
    	});

    	$$self.$inject_state = $$props => {
    		if ("poll" in $$props) $$invalidate(0, poll = $$props.poll);
    		if ("totalVotes" in $$props) $$invalidate(1, totalVotes = $$props.totalVotes);
    		if ("percentA" in $$props) $$invalidate(11, percentA = $$props.percentA);
    		if ("percentB" in $$props) $$invalidate(12, percentB = $$props.percentB);
    	};

    	let totalVotes;
    	let percentA;
    	let percentB;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*poll*/ 1) {
    			 $$invalidate(1, totalVotes = poll.votesA + poll.votesB);
    		}

    		if ($$self.$$.dirty & /*totalVotes, poll*/ 3) {
    			 $$invalidate(11, percentA = Math.floor(100 / totalVotes * poll.votesA) || 0);
    		}

    		if ($$self.$$.dirty & /*totalVotes, poll*/ 3) {
    			 $$invalidate(12, percentB = Math.floor(100 / totalVotes * poll.votesB) || 0);
    		}

    		if ($$self.$$.dirty & /*percentA*/ 2048) {
    			 tweenedA.set(percentA);
    		}

    		if ($$self.$$.dirty & /*percentB*/ 4096) {
    			 tweenedB.set(percentB);
    		}
    	};

    	return [
    		poll,
    		totalVotes,
    		$tweenedA,
    		$tweenedB,
    		tweenedA,
    		tweenedB,
    		handleVote,
    		handleDelete,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class PollDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { poll: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PollDetails",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*poll*/ ctx[0] === undefined && !("poll" in props)) {
    			console.warn("<PollDetails> was created without expected prop 'poll'");
    		}
    	}

    	get poll() {
    		throw new Error("<PollDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set poll(value) {
    		throw new Error("<PollDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PollList.svelte generated by Svelte v3.28.0 */
    const file$7 = "src/components/PollList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (31:4) {#each $PollStore as poll (poll.id)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let polldetails;
    	let t;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	polldetails = new PollDetails({
    			props: { poll: /*poll*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(polldetails.$$.fragment);
    			t = space();
    			add_location(div, file$7, 31, 8, 689);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(polldetails, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const polldetails_changes = {};
    			if (dirty & /*$PollStore*/ 1) polldetails_changes.poll = /*poll*/ ctx[1];
    			polldetails.$set(polldetails_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 500 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(polldetails.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(polldetails.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();

    			if (local) {
    				div_outro = create_out_transition(div, scale, {});
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(polldetails);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(31:4) {#each $PollStore as poll (poll.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$PollStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*poll*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "poll-list svelte-31vrvu");
    			add_location(div, file$7, 29, 0, 616);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$PollStore*/ 1) {
    				const each_value = /*$PollStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $PollStore;
    	validate_store(PollStore, "PollStore");
    	component_subscribe($$self, PollStore, $$value => $$invalidate(0, $PollStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PollList", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PollList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		slide,
    		scale,
    		flip,
    		PollStore,
    		PollDetails,
    		$PollStore
    	});

    	return [$PollStore];
    }

    class PollList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PollList",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/RegisterUserForm.svelte generated by Svelte v3.28.0 */

    const { console: console_1 } = globals;
    const file$8 = "src/components/RegisterUserForm.svelte";

    // (70:4) <Button type="secondary" flat={true} inverse={false}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Register");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(70:4) <Button type=\\\"secondary\\\" flat={true} inverse={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div0;
    	let t3_value = /*errors*/ ctx[1].username + "";
    	let t3;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let t8_value = /*errors*/ ctx[1].password + "";
    	let t8;
    	let t9;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "secondary",
    				flat: true,
    				inverse: false,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			create_component(button.$$.fragment);
    			attr_dev(label0, "for", "username");
    			attr_dev(label0, "class", "svelte-kn6398");
    			add_location(label0, file$8, 60, 8, 2025);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "class", "svelte-kn6398");
    			add_location(input0, file$8, 61, 8, 2072);
    			attr_dev(div0, "class", "error svelte-kn6398");
    			add_location(div0, file$8, 62, 8, 2143);
    			attr_dev(div1, "class", "form-field svelte-kn6398");
    			add_location(div1, file$8, 59, 4, 1992);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "svelte-kn6398");
    			add_location(label1, file$8, 65, 8, 2234);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "class", "svelte-kn6398");
    			add_location(input1, file$8, 66, 8, 2281);
    			attr_dev(div2, "class", "error svelte-kn6398");
    			add_location(div2, file$8, 67, 8, 2352);
    			attr_dev(div3, "class", "form-field svelte-kn6398");
    			add_location(div3, file$8, 64, 4, 2201);
    			attr_dev(form, "class", "svelte-kn6398");
    			add_location(form, file$8, 58, 0, 1940);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*fields*/ ctx[0].username);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*fields*/ ctx[0].password);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(form, t9);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*submitHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1 && input0.value !== /*fields*/ ctx[0].username) {
    				set_input_value(input0, /*fields*/ ctx[0].username);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t3_value !== (t3_value = /*errors*/ ctx[1].username + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*fields*/ 1 && input1.value !== /*fields*/ ctx[0].password) {
    				set_input_value(input1, /*fields*/ ctx[0].password);
    			}

    			if ((!current || dirty & /*errors*/ 2) && t8_value !== (t8_value = /*errors*/ ctx[1].password + "")) set_data_dev(t8, t8_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RegisterUserForm", slots, []);
    	let dispatch = createEventDispatcher();
    	let fields = { username: "", password: "" };
    	let errors = { username: "", password: "" };
    	let valid = false;

    	const submitHandler = async () => {
    		valid = true;

    		// Validate username
    		if (fields.username.trim().length < 3) {
    			valid = false;
    			$$invalidate(1, errors.username = "Username must be at least 3 characters long", errors);
    		} else {
    			// refresh error in case of multiple submissions
    			$$invalidate(1, errors.username = "", errors);
    		}

    		// Validate password
    		if (fields.password.trim().length < 8) {
    			valid = false;
    			$$invalidate(1, errors.password = "Password must be at least 8 characters long", errors);
    		} else {
    			$$invalidate(1, errors.password = "", errors);
    		}

    		if (valid) {
    			const url = "http://localhost:4000/register/";

    			const submitBody = JSON.stringify({
    				username: fields.username,
    				password: fields.password
    			});

    			const response = await fetch(url, {
    				method: "POST",
    				mode: "no-cors", // no-cors, *cors, same-origin
    				cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    				credentials: "include", // include, *same-origin, omit
    				headers: { "Content-Type": "application/json" },
    				body: submitBody
    			});

    			if (response) {
    				console.log("reached4");
    				let user = fields;

    				// save user to Store
    				PollStore.update(currentUsers => {
    					return [user, ...currentUsers];
    				});

    				dispatch("add");
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<RegisterUserForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.username = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.password = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		UserStore: PollStore,
    		createEventDispatcher,
    		dispatch,
    		Button,
    		fields,
    		errors,
    		valid,
    		submitHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    		if ("valid" in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fields, errors, submitHandler, input0_input_handler, input1_input_handler];
    }

    class RegisterUserForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegisterUserForm",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/LoginUserForm.svelte generated by Svelte v3.28.0 */

    const { console: console_1$1 } = globals;
    const file$9 = "src/components/LoginUserForm.svelte";

    // (68:4) <Button type="secondary" flat={true} inverse={false}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Login");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(68:4) <Button type=\\\"secondary\\\" flat={true} inverse={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div0;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let t9;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "secondary",
    				flat: true,
    				inverse: false,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = `${/*errors*/ ctx[1].username}`;
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			div2.textContent = `${/*errors*/ ctx[1].password}`;
    			t9 = space();
    			create_component(button.$$.fragment);
    			attr_dev(label0, "for", "username");
    			attr_dev(label0, "class", "svelte-kn6398");
    			add_location(label0, file$9, 58, 8, 1970);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "class", "svelte-kn6398");
    			add_location(input0, file$9, 59, 8, 2017);
    			attr_dev(div0, "class", "error svelte-kn6398");
    			add_location(div0, file$9, 60, 8, 2088);
    			attr_dev(div1, "class", "form-field svelte-kn6398");
    			add_location(div1, file$9, 57, 4, 1937);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "svelte-kn6398");
    			add_location(label1, file$9, 63, 8, 2179);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "class", "svelte-kn6398");
    			add_location(input1, file$9, 64, 8, 2226);
    			attr_dev(div2, "class", "error svelte-kn6398");
    			add_location(div2, file$9, 65, 8, 2297);
    			attr_dev(div3, "class", "form-field svelte-kn6398");
    			add_location(div3, file$9, 62, 4, 2146);
    			attr_dev(form, "class", "svelte-kn6398");
    			add_location(form, file$9, 56, 0, 1885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*fields*/ ctx[0].username);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input1);
    			set_input_value(input1, /*fields*/ ctx[0].password);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(form, t9);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*submitHandler*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1 && input0.value !== /*fields*/ ctx[0].username) {
    				set_input_value(input0, /*fields*/ ctx[0].username);
    			}

    			if (dirty & /*fields*/ 1 && input1.value !== /*fields*/ ctx[0].password) {
    				set_input_value(input1, /*fields*/ ctx[0].password);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoginUserForm", slots, []);
    	let fields = { username: "", password: "" };
    	let errors = { username: "", password: "" };
    	let valid = false;

    	const submitHandler = async () => {
    		valid = true;

    		// Validate username
    		/*if(fields.username.trim().length < 3){
        valid = false
        errors.username = "Username must be at least 3 characters long"
    } else {
        // refresh error in case of multiple submissions
        errors.username = ''
    }
    // Validate password
    if(fields.password.trim().length < 8){
        valid = false
        errors.password = "Password must be at least 8 characters long"
    } else {
        errors.password = ''
    }*/
    		//if(valid){
    		const url = "http://localhost:4000/login/";

    		const submitBody = JSON.stringify({
    			username: fields.username,
    			password: fields.password
    		});

    		const response = await fetch(url, {
    			method: "POST",
    			mode: "cors", // no-cors, *cors, same-origin
    			cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    			credentials: "omit", // include, *same-origin, omit
    			headers: { "Content-Type": "application/json" },
    			body: submitBody
    		});

    		if (response.ok) {
    			const responseJSON = await response.json();
    			console.log(responseJSON.jwt);
    		} /*let user = fields
    // save user to Store
    UserStore.update((currentUsers) => {
        return [user, ...currentUsers]
    })*/
    	}; //}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<LoginUserForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		fields.username = this.value;
    		$$invalidate(0, fields);
    	}

    	function input1_input_handler() {
    		fields.password = this.value;
    		$$invalidate(0, fields);
    	}

    	$$self.$capture_state = () => ({
    		UserStore: PollStore,
    		Button,
    		fields,
    		errors,
    		valid,
    		submitHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    		if ("valid" in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fields, errors, submitHandler, input0_input_handler, input1_input_handler];
    }

    class LoginUserForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginUserForm",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const UserStore = writable([]);

    /* src/components/UserDetails.svelte generated by Svelte v3.28.0 */
    const file$a = "src/components/UserDetails.svelte";

    // (32:12) <Button type="primary" flat={true} inverse={false} on:click={() => handleDelete(user.username)}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(32:12) <Button type=\\\"primary\\\" flat={true} inverse={false} on:click={() => handleDelete(user.username)}>",
    		ctx
    	});

    	return block;
    }

    // (25:0) <Card>
    function create_default_slot$4(ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*user*/ ctx[0].username + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = /*user*/ ctx[0]._id.$oid + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = /*user*/ ctx[0].dateCreated + "";
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9_value = /*user*/ ctx[0].dateUpdated + "";
    	let t9;
    	let t10;
    	let div0;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				type: "primary",
    				flat: true,
    				inverse: false,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("ID: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Created: ");
    			t6 = text(t6_value);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Latest update: ");
    			t9 = text(t9_value);
    			t10 = space();
    			div0 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(h3, "class", "svelte-updroq");
    			add_location(h3, file$a, 26, 8, 688);
    			attr_dev(p0, "class", "svelte-updroq");
    			add_location(p0, file$a, 27, 8, 721);
    			attr_dev(p1, "class", "svelte-updroq");
    			add_location(p1, file$a, 28, 8, 756);
    			attr_dev(p2, "class", "svelte-updroq");
    			add_location(p2, file$a, 29, 8, 799);
    			attr_dev(div0, "class", "delete svelte-updroq");
    			add_location(div0, file$a, 30, 8, 848);
    			attr_dev(div1, "class", "user");
    			add_location(div1, file$a, 25, 4, 661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(div1, t10);
    			append_dev(div1, div0);
    			mount_component(button, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*user*/ 1) && t0_value !== (t0_value = /*user*/ ctx[0].username + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*user*/ 1) && t3_value !== (t3_value = /*user*/ ctx[0]._id.$oid + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*user*/ 1) && t6_value !== (t6_value = /*user*/ ctx[0].dateCreated + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*user*/ 1) && t9_value !== (t9_value = /*user*/ ctx[0].dateUpdated + "")) set_data_dev(t9, t9_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(25:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, user*/ 9) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UserDetails", slots, []);
    	let { user } = $$props;

    	const handleDelete = async username => {
    		const url = "http://localhost:4000/u/" + username;

    		const response = await fetch(url, {
    			method: "DELETE",
    			headers: { "Content-Type": "application/json" }
    		});

    		if (response.ok) {
    			UserStore.update(currentUsers => {
    				return currentUsers.filter(user => user.username != username);
    			});
    		}
    	};

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserDetails> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleDelete(user.username);

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		UserStore,
    		Card,
    		Button,
    		user,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, handleDelete, click_handler];
    }

    class UserDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetails",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<UserDetails> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<UserDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<UserDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/UserList.svelte generated by Svelte v3.28.0 */

    const { console: console_1$2 } = globals;
    const file$b = "src/components/UserList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (42:4) {#each $UserStore as user (user._id)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let userdetails;
    	let t;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	userdetails = new UserDetails({
    			props: { user: /*user*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(userdetails.$$.fragment);
    			t = space();
    			add_location(div, file$b, 42, 8, 1050);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(userdetails, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const userdetails_changes = {};
    			if (dirty & /*$UserStore*/ 1) userdetails_changes.user = /*user*/ ctx[3];
    			userdetails.$set(userdetails_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 500 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userdetails.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fade, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userdetails.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();

    			if (local) {
    				div_outro = create_out_transition(div, scale, {});
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(userdetails);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(42:4) {#each $UserStore as user (user._id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$UserStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[3]._id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "user-list svelte-1v54wjs");
    			add_location(div, file$b, 40, 0, 976);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$UserStore*/ 1) {
    				const each_value = /*$UserStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $UserStore;
    	validate_store(UserStore, "UserStore");
    	component_subscribe($$self, UserStore, $$value => $$invalidate(0, $UserStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UserList", slots, []);
    	let { users = [] } = $$props;

    	const unsub = UserStore.subscribe(data => {
    		$$invalidate(1, users = data);
    	});

    	onMount(async () => {
    		const url = "http://localhost:4000/u/";

    		const response = await fetch(url, {
    			method: "GET",
    			headers: { "Content-Type": "application/json" }
    		});

    		if (response.ok) {
    			const data = await response.json();
    			console.log(data);

    			UserStore.update(currentUsers => {
    				return data;
    			});
    		}
    	});

    	onDestroy(() => {
    		// unsub from Store
    		unsub();
    	});

    	const writable_props = ["users"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<UserList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("users" in $$props) $$invalidate(1, users = $$props.users);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		fade,
    		slide,
    		scale,
    		flip,
    		UserStore,
    		UserDetails,
    		users,
    		unsub,
    		$UserStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("users" in $$props) $$invalidate(1, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$UserStore, users];
    }

    class UserList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { users: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserList",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get users() {
    		throw new Error("<UserList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<UserList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.28.0 */
    const file$c = "src/App.svelte";

    // (39:35) 
    function create_if_block_4(ctx) {
    	let loginuserform;
    	let current;
    	loginuserform = new LoginUserForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loginuserform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loginuserform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loginuserform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loginuserform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loginuserform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(39:35) ",
    		ctx
    	});

    	return block;
    }

    // (37:41) 
    function create_if_block_3(ctx) {
    	let registeruserform;
    	let current;
    	registeruserform = new RegisterUserForm({ $$inline: true });
    	registeruserform.$on("add", /*handleAdd*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(registeruserform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(registeruserform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(registeruserform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(registeruserform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(registeruserform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(37:41) ",
    		ctx
    	});

    	return block;
    }

    // (35:34) 
    function create_if_block_2$1(ctx) {
    	let userlist;
    	let current;
    	userlist = new UserList({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(userlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(userlist, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(userlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(35:34) ",
    		ctx
    	});

    	return block;
    }

    // (33:41) 
    function create_if_block_1$1(ctx) {
    	let createpollform;
    	let current;
    	createpollform = new CreatePollForm({ $$inline: true });
    	createpollform.$on("add", /*handleAdd*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(createpollform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(createpollform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(createpollform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(createpollform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(createpollform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(33:41) ",
    		ctx
    	});

    	return block;
    }

    // (31:1) {#if activeItem === 'Current Polls'}
    function create_if_block$1(ctx) {
    	let polllist;
    	let current;
    	polllist = new PollList({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(polllist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(polllist, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(polllist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(polllist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(polllist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:1) {#if activeItem === 'Current Polls'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let header;
    	let t0;
    	let main;
    	let tabs;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });

    	tabs = new Tabs({
    			props: {
    				items: /*items*/ ctx[1],
    				activeItem: /*activeItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	tabs.$on("tabChange", /*tabChange*/ ctx[2]);

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_1$1,
    		create_if_block_2$1,
    		create_if_block_3,
    		create_if_block_4
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === "Current Polls") return 0;
    		if (/*activeItem*/ ctx[0] === "Add new Poll") return 1;
    		if (/*activeItem*/ ctx[0] === "Users") return 2;
    		if (/*activeItem*/ ctx[0] === "Add new User") return 3;
    		if (/*activeItem*/ ctx[0] === "Log in") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1w6z2mv");
    			add_location(main, file$c, 28, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(tabs, main, null);
    			append_dev(main, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(tabs);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let items = ["Current Polls", "Add new Poll", "Users", "Add new User", "Log in"];
    	let activeItem = "Current Polls";

    	const tabChange = e => {
    		$$invalidate(0, activeItem = e.detail);
    	};

    	const handleAdd = e => {
    		if (activeItem === "Add new Poll") {
    			$$invalidate(0, activeItem = "Current Polls");
    		} else if (activeItem === "Add new User") {
    			$$invalidate(0, activeItem = "Users");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		Tabs,
    		CreatePollForm,
    		PollList,
    		RegisterUserForm,
    		LoginUserForm,
    		UserList,
    		items,
    		activeItem,
    		tabChange,
    		handleAdd
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("activeItem" in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, items, tabChange, handleAdd];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
