import { FlutterPreview } from '@/components/flutter-preview'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

export default function AvatarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Avatar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Flutter implementation of the Avatar component.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <FlutterPreview path="/docs/avatar" />
        <div className="h-4"></div>
        <CodeBlock 
          language="dart"
          code={`import 'package:refraction_ui/refraction_ui.dart';

class MyAvatarExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Avatar(
      // Add props here
    );
  }
}`} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Bounded photos and complete originals</h2>
        <p className="text-muted-foreground">
          RefractionBoundedAvatar decodes at physical display size, up to 512 pixels per axis,
          without upscaling small originals. Cover preserves photo cropping; contain shows
          the complete illustration. Loading and failed images retain shared initials;
          loaded transparent artwork has no placeholder glyph behind it.
        </p>
        <CodeBlock language="dart" code={`RefractionBoundedAvatar(
  imageUrl: artworkUrl,
  fallbackText: 'JD',
  size: 64,
  fit: BoxFit.contain,
)`} />
        <PropsTable props={[
          { name: 'imageUrl', type: 'String?', default: 'null', description: 'Network photo or artwork; no source shows shared initials.' },
          { name: 'imageProvider', type: 'ImageProvider?', default: 'null', description: 'Injected image source instead of the network URL.' },
          { name: 'fallbackText', type: 'String', description: 'Required shared initials for no source, loading or failure.' },
          { name: 'size', type: 'double', default: '40', description: 'Logical square bounds; device scale determines bounded decoding.' },
          { name: 'radius', type: 'double', default: '999', description: 'Shared photo corner shape; full containment does not clip illustration corners.' },
          { name: 'fit', type: 'BoxFit', default: 'BoxFit.cover', description: 'Use contain for complete originals or cover for existing profile-photo crops.' },
          { name: 'onImageError', type: 'VoidCallback?', default: 'null', description: 'One notification per failed provider, without private diagnostics.' },
          { name: 'onImageProviderChanged', type: 'ValueChanged<ImageProvider?>?', default: 'null', description: 'Exact bounded provider; null retires the old registration on replacement or disposal.' },
        ]} />
        <p className="text-sm text-muted-foreground">
          The host owns authorization, expiry and private image cache eviction. Provider
          lifecycle notifications expose image state, never an access grant.
        </p>
      </section>
    </div>
  )
}
