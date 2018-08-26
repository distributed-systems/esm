#/usr/bin/env bash
_esm_completions()
{   
    local original="$IFS"

    words=("${COMP_WORDS[@]}")
    IFS=$'\n' COMPREPLY=($(esm complete "$COMP_CWORD" "$COMP_LINE" "${COMP_WORDS[@]}")) || return $?
    IFS="$original"
}

complete -o nospace -F _esm_completions esm