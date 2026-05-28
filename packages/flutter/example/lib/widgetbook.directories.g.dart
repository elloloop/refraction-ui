// dart format width=80
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_import, prefer_relative_imports, directives_ordering

// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AppGenerator
// **************************************************************************

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:example/use_cases/avatar_group_use_cases.dart'
    as _example_use_cases_avatar_group_use_cases;
import 'package:example/use_cases/code_block_use_cases.dart'
    as _example_use_cases_code_block_use_cases;
import 'package:example/use_cases/combobox_use_cases.dart'
    as _example_use_cases_combobox_use_cases;
import 'package:example/use_cases/command_use_cases.dart'
    as _example_use_cases_command_use_cases;
import 'package:example/use_cases/link_card_use_cases.dart'
    as _example_use_cases_link_card_use_cases;
import 'package:example/use_cases/otp_input_use_cases.dart'
    as _example_use_cases_otp_input_use_cases;
import 'package:example/use_cases/pagination_use_cases.dart'
    as _example_use_cases_pagination_use_cases;
import 'package:example/use_cases/payment_use_cases.dart'
    as _example_use_cases_payment_use_cases;
import 'package:example/use_cases/popover_use_cases.dart'
    as _example_use_cases_popover_use_cases;
import 'package:example/use_cases/presence_indicator_use_cases.dart'
    as _example_use_cases_presence_indicator_use_cases;
import 'package:example/use_cases/progress_display_use_cases.dart'
    as _example_use_cases_progress_display_use_cases;
import 'package:example/use_cases/radio_use_cases.dart'
    as _example_use_cases_radio_use_cases;
import 'package:example/use_cases/skip_to_content_use_cases.dart'
    as _example_use_cases_skip_to_content_use_cases;
import 'package:example/use_cases/slide_viewer_use_cases.dart'
    as _example_use_cases_slide_viewer_use_cases;
import 'package:example/use_cases/slider_use_cases.dart'
    as _example_use_cases_slider_use_cases;
import 'package:example/use_cases/status_indicator_use_cases.dart'
    as _example_use_cases_status_indicator_use_cases;
import 'package:example/use_cases/steps_use_cases.dart'
    as _example_use_cases_steps_use_cases;
import 'package:example/use_cases/switch_use_cases.dart'
    as _example_use_cases_switch_use_cases;
import 'package:example/use_cases/table_of_contents_use_cases.dart'
    as _example_use_cases_table_of_contents_use_cases;
import 'package:example/use_cases/tabs_use_cases.dart'
    as _example_use_cases_tabs_use_cases;
import 'package:example/use_cases/textarea_use_cases.dart'
    as _example_use_cases_textarea_use_cases;
import 'package:example/use_cases/thread_view_use_cases.dart'
    as _example_use_cases_thread_view_use_cases;
import 'package:example/use_cases/toast_use_cases.dart'
    as _example_use_cases_toast_use_cases;
import 'package:example/use_cases/tooltip_use_cases.dart'
    as _example_use_cases_tooltip_use_cases;
import 'package:example/use_cases/version_selector_use_cases.dart'
    as _example_use_cases_version_selector_use_cases;
import 'package:example/use_cases/video_player_use_cases.dart'
    as _example_use_cases_video_player_use_cases;
import 'package:example/use_cases/voice_pill_use_cases.dart'
    as _example_use_cases_voice_pill_use_cases;
import 'package:example/use_cases/waveform_use_cases.dart'
    as _example_use_cases_waveform_use_cases;
import 'package:widgetbook/widgetbook.dart' as _widgetbook;

final directories = <_widgetbook.WidgetbookNode>[
  _widgetbook.WidgetbookFolder(
    name: 'components',
    children: [
      _widgetbook.WidgetbookComponent(
        name: 'RefractionAvatarGroup',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Size',
            builder: _example_use_cases_avatar_group_use_cases
                .avatarGroupCustomSizeUseCase,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_avatar_group_use_cases
                .avatarGroupDefaultUseCase,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Many Avatars',
            builder: _example_use_cases_avatar_group_use_cases
                .avatarGroupManyAvatarsUseCase,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'No Overflow',
            builder: _example_use_cases_avatar_group_use_cases
                .avatarGroupNoOverflowUseCase,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionCodeBlock',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_code_block_use_cases.defaultCodeBlock,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'No Copy Button',
            builder: _example_use_cases_code_block_use_cases.noCopyCodeBlock,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Language',
            builder: _example_use_cases_code_block_use_cases.languageCodeBlock,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionCombobox',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder:
                _example_use_cases_combobox_use_cases.defaultComboboxUseCase,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder:
                _example_use_cases_combobox_use_cases.disabledComboboxUseCase,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionCommand',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_command_use_cases.defaultCommand,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Many Items',
            builder: _example_use_cases_command_use_cases.manyItemsCommand,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionLinkCard',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_link_card_use_cases.defaultLinkCard,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_link_card_use_cases.disabledLinkCard,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Minimal',
            builder: _example_use_cases_link_card_use_cases.minimalLinkCard,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionOtpInput',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_otp_input_use_cases.defaultOtpInput,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Short',
            builder: _example_use_cases_otp_input_use_cases.shortOtpInput,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionPagination',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_pagination_use_cases.defaultPagination,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Middle Page',
            builder: _example_use_cases_pagination_use_cases.middlePagination,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'No Controls',
            builder:
                _example_use_cases_pagination_use_cases.noControlsPagination,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionPayment',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_payment_use_cases.defaultPayment,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Processing',
            builder: _example_use_cases_payment_use_cases.processingPayment,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Error',
            builder: _example_use_cases_payment_use_cases.errorPayment,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionPopover',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_popover_use_cases.defaultPopover,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Offset',
            builder: _example_use_cases_popover_use_cases.offsetPopover,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionPresenceIndicator',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Away with Label',
            builder:
                _example_use_cases_presence_indicator_use_cases.awayPresence,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Large Busy',
            builder:
                _example_use_cases_presence_indicator_use_cases.busyPresence,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Online',
            builder:
                _example_use_cases_presence_indicator_use_cases.onlinePresence,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionProgressDisplay',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Circular',
            builder: _example_use_cases_progress_display_use_cases.circular,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Circular (No Label)',
            builder:
                _example_use_cases_progress_display_use_cases.circularNoLabel,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Color',
            builder: _example_use_cases_progress_display_use_cases.customColor,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Linear (Default)',
            builder:
                _example_use_cases_progress_display_use_cases.linearDefault,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Linear (No Label)',
            builder:
                _example_use_cases_progress_display_use_cases.linearNoLabel,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionRadio',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_radio_use_cases.defaultRadio,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_radio_use_cases.disabledRadio,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionSkipToContent',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Label',
            builder: _example_use_cases_skip_to_content_use_cases
                .customLabelSkipToContent,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_skip_to_content_use_cases
                .defaultSkipToContent,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionSlideViewer',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Renderer',
            builder: _example_use_cases_slide_viewer_use_cases
                .customRendererSlideViewer,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder:
                _example_use_cases_slide_viewer_use_cases.defaultSlideViewer,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionSlider',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Colors',
            builder: _example_use_cases_slider_use_cases.customColorsSlider,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_slider_use_cases.defaultSlider,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_slider_use_cases.disabledSlider,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionStatusIndicator',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Labels',
            builder: _example_use_cases_status_indicator_use_cases
                .customLabelStatusIndicator,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_status_indicator_use_cases
                .defaultStatusIndicator,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionSteps',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Horizontal',
            builder: _example_use_cases_steps_use_cases.horizontalSteps,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Vertical',
            builder: _example_use_cases_steps_use_cases.verticalSteps,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionSwitch',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_switch_use_cases.defaultSwitch,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_switch_use_cases.disabledSwitch,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionTableOfContents',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_table_of_contents_use_cases
                .defaultTableOfContents,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Active Item',
            builder: _example_use_cases_table_of_contents_use_cases
                .activeTableOfContents,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionTabs',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_tabs_use_cases.defaultTabs,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Preselected Index',
            builder: _example_use_cases_tabs_use_cases.preselectedTabs,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionTextarea',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Custom Min/Max Lines',
            builder: _example_use_cases_textarea_use_cases.customLinesTextarea,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_textarea_use_cases.defaultTextarea,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_textarea_use_cases.disabledTextarea,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Text',
            builder: _example_use_cases_textarea_use_cases.withTextTextarea,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionThreadView',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_thread_view_use_cases.defaultThreadView,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Empty',
            builder: _example_use_cases_thread_view_use_cases.emptyThreadView,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionToast',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_toast_use_cases.defaultToast,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'With Description',
            builder: _example_use_cases_toast_use_cases.descriptionToast,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionTooltip',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_tooltip_use_cases.defaultTooltip,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Rich Content',
            builder: _example_use_cases_tooltip_use_cases.richTooltip,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionVersionSelector',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder: _example_use_cases_version_selector_use_cases
                .defaultVersionSelector,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Disabled',
            builder: _example_use_cases_version_selector_use_cases
                .disabledVersionSelector,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionVideoPlayer',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default',
            builder:
                _example_use_cases_video_player_use_cases.defaultVideoPlayer,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionVoicePill',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default AI',
            builder: _example_use_cases_voice_pill_use_cases.defaultVoicePill,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'User Muted',
            builder: _example_use_cases_voice_pill_use_cases.userMutedVoicePill,
          ),
        ],
      ),
      _widgetbook.WidgetbookComponent(
        name: 'RefractionWaveform',
        useCases: [
          _widgetbook.WidgetbookUseCase(
            name: 'Default Bars',
            builder: _example_use_cases_waveform_use_cases.defaultWaveform,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Line Variant',
            builder: _example_use_cases_waveform_use_cases.lineWaveform,
          ),
          _widgetbook.WidgetbookUseCase(
            name: 'Rings Variant',
            builder: _example_use_cases_waveform_use_cases.ringsWaveform,
          ),
        ],
      ),
    ],
  ),
];
