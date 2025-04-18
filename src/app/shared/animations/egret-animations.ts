import {
    sequence,
    trigger,
    animate,
    style,
    group,
    query,
    transition,
    animateChild,
    state,
    animation,
    useAnimation,
    stagger, keyframes
} from '@angular/animations';


const reusable = animation(
    [
        style({
            opacity: '{{opacity}}',
            transform: 'scale({{scale}}) translate3d({{x}}, {{y}}, {{z}})'
        }),
        animate('{{duration}} {{delay}} cubic-bezier(0.0, 0.0, 0.2, 1)', style('*'))
    ],
    {
        params: {
            duration: '200ms',
            delay: '0ms',
            opacity: '0',
            scale: '1',
            x: '0',
            y: '0',
            z: '0'
        }
    }
);

// =========================
// Fade
// =========================
export const fadeIn = animation([
    style({opacity: 0}), // start state
    animate('{{time}}', style({opacity: 1}))
]);

export const fadeOut = animation([
    animate('{{time}}', style({opacity: 0}))
]);

export enum AnimationType {
    Scale = 'scale',
    Fade = 'fade',
    Flip = 'flip',
    JackInTheBox = 'jackInTheBox'
}

export const egretAnimations = [
    trigger('animate', [transition('void => *', [useAnimation(reusable)])]),

    // trigger('fadeInOut', [
    //     state(
    //         '0',
    //         style({
    //             opacity: 0,
    //             display: 'none'
    //         })
    //     ),
    //     state(
    //         '1',
    //         style({
    //             opacity: 1,
    //             display: 'block'
    //         })
    //     ),
    //     transition('0 => 1', animate('300ms')),
    //     transition('1 => 0', animate('300ms'))
    // ]),

    trigger('fadeInOut', [
        transition('void => *', [useAnimation(fadeIn, {params: {time: '300ms'}})]),
        transition('* => void', [useAnimation(fadeOut, {params: {time: '300ms'}})]),
    ])

];




// =========================
// Scale
// =========================
export const scaleIn = animation([
    style({opacity: 0, transform: 'scale(0.5)'}), // start state
    animate(
        '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
        style({opacity: 1, transform: 'scale(1)'})
    )
]);

export const scaleOut = animation([
    animate(
        '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
        style({opacity: 0, transform: 'scale(0.5)'})
    )
]);


// =========================
// Flip
// =========================
export const flipIn = animation([
    animate(
        '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
        keyframes([
            style({
                opacity: 1,
                transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)',
                offset: 0
            }), // start state
            style({transform: 'perspective(400px)', offset: 1})
        ])
    )
]);

export const flipOut = animation([
    // just hide it
]);

// =========================
// Jack in the box
// =========================
export const jackIn = animation([
    animate(
        '{{time}} ease-in',
        keyframes([
            style({
                animationFillMode: 'forwards',
                transform: 'scale(0.1) rotate(30deg)',
                transformOrigin: 'center bottom',
                offset: 0
            }),
            style({
                transform: 'rotate(-10deg)',
                offset: 0.5
            }),
            style({
                transform: 'rotate(3deg)',
                offset: 0.7
            }),
            style({
                transform: 'perspective(400px)',
                offset: 1
            })
        ])
    )
]);

export const jackOut = animation([
    // just hide it
]);
