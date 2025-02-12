import { UserName } from '@app/protocol/packet/attributes/001_UserName';
import { UserPassword } from '@app/protocol/packet/attributes/002_UserPassword';
import { CHAPPassword } from '@app/protocol/packet/attributes/003_CHAPPassword';
import { NASIPAddress } from '@app/protocol/packet/attributes/004_NASIPAddress';
import { NASPort } from '@app/protocol/packet/attributes/005_NASPort';
import { ServiceType } from '@app/protocol/packet/attributes/006_ServiceType';
import { FramedProtocol } from '@app/protocol/packet/attributes/007_FramedProtocol';
import { FramedIPAddress } from '@app/protocol/packet/attributes/008_FramedIPAddress';
import { FramedIPNetmask } from '@app/protocol/packet/attributes/009_FramedIPNetmask';
import { FramedRouting } from '@app/protocol/packet/attributes/010_FramedRouting';
import { FilterId } from '@app/protocol/packet/attributes/011_FilterId';
import { FramedMTU } from '@app/protocol/packet/attributes/012_FramedMTU';
import { FramedCompression } from '@app/protocol/packet/attributes/013_FramedCompression';
import { LoginIPHost } from '@app/protocol/packet/attributes/014_LoginIPHost';
import { LoginService } from '@app/protocol/packet/attributes/015_LoginService';
import { LoginTCPPort } from '@app/protocol/packet/attributes/016_LoginTCPPort';
import { ReplyMessage } from '@app/protocol/packet/attributes/018_ReplyMessage';
import { CallbackNumber } from '@app/protocol/packet/attributes/019_CallbackNumber';
import { CallbackId } from '@app/protocol/packet/attributes/020_CallbackId';
import { AttributeClass } from '@app/types/Attribute';
import { FramedRoute } from '@app/protocol/packet/attributes/022_FramedRoute';
import { FramedIPXNetwork } from '@app/protocol/packet/attributes/023_FramedIPXNetwork';
import { State } from '@app/protocol/packet/attributes/024_State';
import { Class } from '@app/protocol/packet/attributes/025_Class';
import { VendorSpecific } from '@app/protocol/packet/attributes/026_VendorSpecific';
import { SessionTimeout } from '@app/protocol/packet/attributes/027_SessionTimeout';

export const ATTRIBUTES_ENTRIES = {
  [UserName.TYPE]: UserName,
  [UserPassword.TYPE]: UserPassword,
  [CHAPPassword.TYPE]: CHAPPassword,
  [NASIPAddress.TYPE]: NASIPAddress,
  [NASPort.TYPE]: NASPort,
  [ServiceType.TYPE]: ServiceType,
  [FramedProtocol.TYPE]: FramedProtocol,
  [FramedIPAddress.TYPE]: FramedIPAddress,
  [FramedIPNetmask.TYPE]: FramedIPNetmask,
  [FramedRouting.TYPE]: FramedRouting,
  [FilterId.TYPE]: FilterId,
  [FramedMTU.TYPE]: FramedMTU,
  [FramedCompression.TYPE]: FramedCompression,
  [LoginIPHost.TYPE]: LoginIPHost,
  [LoginService.TYPE]: LoginService,
  [LoginTCPPort.TYPE]: LoginTCPPort,
  [ReplyMessage.TYPE]: ReplyMessage,
  [CallbackNumber.TYPE]: CallbackNumber,
  [CallbackId.TYPE]: CallbackId,
  [FramedRoute.TYPE]: FramedRoute,
  [FramedIPXNetwork.TYPE]: FramedIPXNetwork,
  [State.TYPE]: State,
  [VendorSpecific.TYPE]: VendorSpecific,
  [Class.TYPE]: Class,
  [SessionTimeout.TYPE]: SessionTimeout,
} as const satisfies Record<number, AttributeClass>;
