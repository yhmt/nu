matchdep  = require "matchdep"
copyright = "// <%= pkg.title %> <%= pkg.version %> " +
            "Copyright (C) #{new Date().getFullYear()} <%= pkg.author %>, " +
            "<%= pkg.license %> License.\n" +
            "// See <%= pkg.url %>\n"

module.exports = (grunt) ->
  config =
    pkg: grunt.file.readJSON "package.json"

    concat:
      dist:
        options:
          banner: copyright
        files:
          "<%= pkg.name %>.all.js": [
            "src/intro.js"
            "src/shims.js"
            "src/variable.js"
            "src/type.js"
            "src/utility.js"
            "src/nu.js"
            "src/exports.js"
            "src/outro.js"
          ]

    uglify:
      dist:
        options:
          mangle: true
          banner: copyright
        files:
          "<%= pkg.name %>.min.js": ["<%= pkg.name %>.all.js"]

    esteWatch:
      options:
        dirs: ["src/**/"]
        livereload:
          enabled: false
      js: (filePath) ->
        files: "src/*.js"
        return ["concat", "jshint", "uglify"]

    jshint:
      src: ["<%= pkg.name %>.all.js"]
      options: do ->
        ret = { globals: {} }
        opt = [
          "curly"    # ループブロックと条件ブロックを常に中括弧で囲うことを強制
          "eqeqeq"
          "eqnull"
          "immed"
          "latedef"
          "undef"
          "regexp"
          "proto"      # protoプロパティに警告を出さない
          # "unused"   # 使用していない変数に警告を出す
          "loopfunc"
          "laxcomma"  # カンマを最初にかくスタイルに警告を出さない
          # "trailing" # 行末のホワイトスペースを禁止
          "browser"
          "devel"
        ]
        for o in opt then ret[o] = true
        opt["maxlen"]            = 120

        return ret

  grunt.initConfig config
  matchdep.filterDev("grunt-*").forEach grunt.loadNpmTasks

  grunt.registerTask "default", "esteWatch"
